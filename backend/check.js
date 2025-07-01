// checkPlacementData.js
const mongoose = require("mongoose");
const PlacementData = require("./models/Placement");
const jobs = require("./models/Job")

async function checkData() {
  await mongoose.connect("mongodb+srv://harsh:harsh123@campus.k0by8i8.mongodb.net/");

  const all = await PlacementData.find({});
  //const jobData = await jobs.find({});
  console.log("Data:\n", all);

  mongoose.connection.close();
}

checkData();
