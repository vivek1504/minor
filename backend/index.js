require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 🔥 IMPORTANT
const BASE_URL = "https://minor-d49z.onrender.com";

// 🧠 Simple session store (CallSid-based)
const sessions = {};

// ================= DB =================
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => console.log("MongoDB connected"));

const Complaint = mongoose.model(
  "Complaint",
  new mongoose.Schema({
    name: String,
    address: String,
    ward: String,
    issue: String,
    category: String,
    zone: String,
    status: { type: String, default: "pending" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    text: String,
    createdAt: { type: Date, default: Date.now },
  })
);

// ================= /VOICE =================
app.post("/voice", (req, res) => {
  console.log("📞 /voice");

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-name`,
    method: "POST",
    speechTimeout: "auto",
    timeout: 5,
  });

  gather.say("Welcome to VMC complaint system. Please say your name.");

  // 🔥 fallback
  twiml.say("Sorry, I didn't hear anything.");
  twiml.redirect(`${BASE_URL}/voice`);

  res.type("text/xml").send(twiml.toString());
});

// ================= /GET-NAME =================
app.post("/get-name", (req, res) => {
  console.log("➡️ /get-name", req.body.SpeechResult);

  const callSid = req.body.CallSid;
  const name = req.body.SpeechResult;

  sessions[callSid] = { name };

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-address`,
    method: "POST",
    speechTimeout: "auto",
    timeout: 5,
  });

  gather.say("Please say your address.");

  twiml.say("I didn't catch that.");
  twiml.redirect(`${BASE_URL}/voice`);

  res.type("text/xml").send(twiml.toString());
});

// ================= /GET-ADDRESS =================
app.post("/get-address", (req, res) => {
  console.log("➡️ /get-address", req.body.SpeechResult);

  const callSid = req.body.CallSid;
  const address = req.body.SpeechResult;

  sessions[callSid].address = address;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-ward`,
    method: "POST",
    speechTimeout: "auto",
    timeout: 5,
  });

  gather.say("Please say your ward number.");

  twiml.say("I didn't catch that.");
  twiml.redirect(`${BASE_URL}/voice`);

  res.type("text/xml").send(twiml.toString());
});

// ================= /GET-WARD =================
app.post("/get-ward", (req, res) => {
  console.log("➡️ /get-ward", req.body.SpeechResult);

  const callSid = req.body.CallSid;
  const ward = req.body.SpeechResult;

  sessions[callSid].ward = ward;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: `${BASE_URL}/get-issue`,
    method: "POST",
    speechTimeout: "auto",
    timeout: 5,
  });

  gather.say("Please describe your issue.");

  twiml.say("I didn't catch that.");
  twiml.redirect(`${BASE_URL}/voice`);

  res.type("text/xml").send(twiml.toString());
});

// ================= /GET-ISSUE =================
app.post("/get-issue", async (req, res) => {
  console.log("➡️ /get-issue", req.body.SpeechResult);

  const callSid = req.body.CallSid;
  const issue = req.body.SpeechResult;

  const session = sessions[callSid];

  const finalData = {
    name: session.name,
    address: session.address,
    ward: session.ward,
    issue,
  };

  sessions[callSid] = finalData;

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "dtmf",
    numDigits: 1,
    timeout: 5,
    action: `${BASE_URL}/confirm`,
    method: "POST",
  });

  gather.say(
    `Please confirm. Name ${finalData.name}. Address ${finalData.address}. Ward ${finalData.ward}. Issue ${finalData.issue}. Press 1 to confirm. Press 2 to retry.`
  );

  twiml.say("No input received.");
  twiml.redirect(`${BASE_URL}/voice`);

  res.type("text/xml").send(twiml.toString());
});

// ================= /CONFIRM =================
app.post("/confirm", async (req, res) => {
  console.log("➡️ /confirm", req.body.Digits);

  const callSid = req.body.CallSid;
  const digit = req.body.Digits;

  const data = sessions[callSid];

  const twiml = new VoiceResponse();

  if (digit === "1") {
    await Complaint.create(data);

    delete sessions[callSid];

    twiml.say("Your complaint has been registered successfully.");
    twiml.hangup();
  } else {
    twiml.say("Let's try again.");
    twiml.redirect(`${BASE_URL}/voice`);
  }

  res.type("text/xml").send(twiml.toString());
});

// ================= DASHBOARD API =================
const cors = require("cors");
app.use(cors());

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
});

app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find({ active: true }).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints", async (req, res) => {
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

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});