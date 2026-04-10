require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const axios = require("axios");
const { prompt } = require("./prompt");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://minor-d49z.onrender.com";

const app = express();
const sessions = {};

const log = (...args) => console.log("[LOG]", new Date().toISOString(), ...args);
const errorLog = (...args) => console.error("[ERROR]", new Date().toISOString(), ...args);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  log(`Incoming Request → ${req.method} ${req.url}`);
  log("Headers:", req.headers);
  log("Query:", req.query);
  log("Body:", req.body);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/complaints", {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const ComplaintSchema = new mongoose.Schema({
  name: String,
  address: String,
  issue: String,
  category: String,
  ward: String,
  zone: String,
  status: { type: String, default: "pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

const EmployeeSchema = new mongoose.Schema({
  name: String,
  role: String,
  department: String,
  zone: String,
  phone: String,
  email: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model("Employee", EmployeeSchema);

app.get("/health", (req, res) => {
  res.send("OK");
})

app.post("/voice", (req, res) => {
  log("📞 /voice triggered");
  const VoiceResponse = require("twilio").twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-name`,
    method: "POST",
    speechTimeout: "auto",
  });

  gather.say("Hello! Thank you for calling the Vadodara Municipal Corporation complaint helpline. To get started, could you please tell me your name?");

  res.type("text/xml").send(twiml.toString());
});

app.post("/get-name", (req, res) => {
  const callSid = req.body.CallSid;
  const name = req.body.SpeechResult;

  sessions[callSid] = { name };

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-address`,
    method: "POST",
  });

  gather.say("Please say your address.");

  res.type("text/xml").send(twiml.toString());
});

app.post("/get-address", (req, res) => {
  const callSid = req.body.CallSid;
  const address = req.body.SpeechResult;

  sessions[callSid].address = address;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-ward`,
    method: "POST",
  });

  gather.say("Please say your ward number.");

  res.type("text/xml").send(twiml.toString());
});

app.post("/get-ward", (req, res) => {
  const callSid = req.body.CallSid;
  const ward = req.body.SpeechResult;

  sessions[callSid].ward = ward;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-issue`,
    method: "POST",
  });

  gather.say("Please describe your issue.");

  res.type("text/xml").send(twiml.toString());
});

app.post("/get-issue", async (req, res) => {
  const callSid = req.body.CallSid;
  const issue = req.body.SpeechResult;

  const session = sessions[callSid];

  const fullText = `
Name: ${session.name}
Address: ${session.address}
Ward: ${session.ward}
Complaint: ${issue}
  `;

  const extracted = await extractComplaintData(fullText);

  const finalData = {
    ...session,
    issue: extracted?.issue || issue,
    category: extracted?.category,
    zone: extracted?.zone,
  };

  sessions[callSid] = finalData;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "dtmf",
    numDigits: 1,
    action: `${BASE_URL}/confirm`,
    method: "POST",
  });

  gather.say(
    `Name ${finalData.name}, Address ${finalData.address}, Ward ${finalData.ward}, Issue ${finalData.issue}. Press 1 to confirm, 2 to retry.`
  );

  res.type("text/xml").send(twiml.toString());
});

app.post("/confirm", async (req, res) => {
  const callSid = req.body.CallSid;
  const digit = req.body.Digits;

  const data = sessions[callSid];

  const twiml = new VoiceResponse();

  if (digit === "1") {
    await Complaint.create(data);

    delete sessions[callSid]; // cleanup

    twiml.say("Complaint registered successfully.");
    twiml.hangup();
  } else {
    twiml.redirect(`${BASE_URL}/voice`);
  }

  res.type("text/xml").send(twiml.toString());
});

app.post("/handle-recording", (req, res) => {
  console.log("Recording completed");
  console.log("Recording URL:", req.body.RecordingUrl);

  const VoiceResponse = require("twilio").twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say("Thank you. Your complaint has been recorded.");

  twiml.hangup();

  res.set("Content-Type", "text/xml");
  res.send(twiml.toString());
});

app.post("/transcription", async (req, res) => {
  log("📝 Transcription received");
  const transcription = req.body.TranscriptionText;
  log("User said:", transcription);

  if (transcription) {
    await Complaint.create({ text: transcription });
  }

  res.send("OK");
});

app.get("/employees", async (req, res) => {
  console.log("Fetching employees...");
  try {
    const employees = await Employee.find({ active: true }).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints", async (req, res) => {
  console.log("Fetching complaints...");
  try {
    const data = await Complaint.find()
      .populate("assignedTo", "name role department zone")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/complaints", async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    console.log("✅ New complaint created from dashboard:", complaint._id);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("assignedTo", "name role department zone phone email");
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/complaints/:id", async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (assignedTo !== undefined) update.assignedTo = assignedTo || null;
    if (notes !== undefined) update.notes = notes;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate("assignedTo", "name role department zone");

    if (!complaint) return res.status(404).json({ error: "Not found" });
    console.log(`✅ Updated complaint ${req.params.id}:`, update);
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function extractComplaintData(text) {
  try {
    log("🧠 Sending to OpenRouter...");
    log("Input Text:", text);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    log("📥 Raw AI Response:", response.data);

    let output = response.data.choices[0].message.content;

    log("🧾 AI Output (raw):", output);

    output = output.trim();

    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      output = output.substring(jsonStart, jsonEnd + 1);
    }

    log("🧾 AI Output (cleaned JSON):", output);

    const parsed = JSON.parse(output);

    log("✅ Parsed AI JSON:", parsed);

    return parsed;
  } catch (err) {
    errorLog("❌ OpenRouter Error:", err.response?.data || err.message);
    return null;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
