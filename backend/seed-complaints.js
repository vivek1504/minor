const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://jadhavvivek2743:NRxfidwJEX9iaiYA@cluster0.qiychex.mongodb.net/complaints?retryWrites=true&w=majority&appName=Cluster0", {
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const ComplaintSchema = new mongoose.Schema({
      name: String,
      address: String,
      issue: String,
      category: String,
      ward: String,
      zone: String,
      status: { type: String, default: "pending" },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
      createdAt: { type: Date, default: Date.now },
    });

    const Complaint = mongoose.model("Complaint", ComplaintSchema);

    const complaints = [
      {
        name: "Vivek Shah",
        address: "Akota, B-42 Residency",
        issue: "Multiple poles flickering since 8 PM near the main road. Very dangerous for pedestrians.",
        category: "street_light",
        ward: "12",
        zone: "West",
        status: "pending",
        createdAt: new Date("2026-04-10T05:15:00Z"),
      },
      {
        name: "Priya Patel",
        address: "Gotri, Shiv Shakti Apt, Block B",
        issue: "Low pressure and murky water in the morning supply. Suspected pipeline leak nearby.",
        category: "water_supply",
        ward: "8",
        zone: "North",
        status: "pending",
        createdAt: new Date("2026-04-10T03:42:00Z"),
      },
      {
        name: "Rajesh Kumar",
        address: "Manjalpur, GIDC Road, near bus stop",
        issue: "Dustbin overflowing near local primary school. Stray dogs spreading garbage everywhere.",
        category: "garbage",
        ward: "4",
        zone: "South",
        status: "pending",
        createdAt: new Date("2026-04-10T03:00:00Z"),
      },
      {
        name: "Meena Desai",
        address: "Alkapuri, Park Avenue, Lane 3",
        issue: "Huge pothole on the main connecting road. Already caused 2 bike accidents this week.",
        category: "road",
        ward: "3",
        zone: "West",
        status: "in_progress",
        createdAt: new Date("2026-04-09T12:30:00Z"),
      },
      {
        name: "Sunil Thakor",
        address: "Karelibaug, beside SBI branch",
        issue: "Drain blocked for 3 days. Water logging on the entire street during rain. Health hazard.",
        category: "drainage",
        ward: "6",
        zone: "East",
        status: "pending",
        createdAt: new Date("2026-04-09T10:00:00Z"),
      },
      {
        name: "Anjali Mehta",
        address: "Fatehgunj, near old post office",
        issue: "Street light pole damaged by truck. Wires exposed and sparking at night. Very dangerous.",
        category: "street_light",
        ward: "1",
        zone: "North",
        status: "pending",
        createdAt: new Date("2026-04-09T08:45:00Z"),
      },
      {
        name: "Bhavesh Rathod",
        address: "Waghodia Road, Ambe Vidyalaya chowk",
        issue: "No water supply for past 4 days. Tanker also not arriving despite complaints to ward office.",
        category: "water_supply",
        ward: "10",
        zone: "East",
        status: "in_progress",
        createdAt: new Date("2026-04-08T14:20:00Z"),
      },
      {
        name: "Kiran Joshi",
        address: "Sama, near Reliance Mart",
        issue: "Large pile of construction debris dumped on the roadside. Blocking half the road.",
        category: "garbage",
        ward: "14",
        zone: "North",
        status: "resolved",
        createdAt: new Date("2026-04-08T09:10:00Z"),
      },
      {
        name: "Deepak Parmar",
        address: "Harni, Shreeji Nagar Society",
        issue: "Sewage line burst near society gate. Foul smell and water flowing into homes.",
        category: "drainage",
        ward: "9",
        zone: "East",
        status: "pending",
        createdAt: new Date("2026-04-07T16:30:00Z"),
      },
      {
        name: "Nisha Chauhan",
        address: "Subhanpura, B/h Town Hall",
        issue: "Road resurfacing work left incomplete. Loose gravel causing accidents for two-wheelers.",
        category: "road",
        ward: "2",
        zone: "West",
        status: "in_progress",
        createdAt: new Date("2026-04-07T11:00:00Z"),
      },
      {
        name: "Ramesh Solanki",
        address: "Tandalja, near water tank",
        issue: "All 5 street lights on the main lane are off since last Monday. Entire area is pitch dark.",
        category: "street_light",
        ward: "7",
        zone: "West",
        status: "pending",
        createdAt: new Date("2026-04-06T18:00:00Z"),
      },
      {
        name: "Geeta Vaghela",
        address: "Makarpura, GIDC Phase 2, Gate no 3",
        issue: "Garbage truck has not come for a week. Waste piling up near factory gate. Workers complaining.",
        category: "garbage",
        ward: "5",
        zone: "South",
        status: "resolved",
        createdAt: new Date("2026-04-06T07:30:00Z"),
      },
    ];

    await Complaint.insertMany(complaints);
    console.log(`✅ Seeded ${complaints.length} dummy complaints`);

    // Print summary
    const cats = {};
    complaints.forEach((c) => {
      cats[c.category] = (cats[c.category] || 0) + 1;
    });
    console.log("   Categories:", cats);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });
