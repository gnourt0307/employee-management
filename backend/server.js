const express = require("express");
const app = express();
const employees = require("../data/employees.json");

app.use(express.json());

app.post("/checkin", async (req, res) => {
  const { mac } = req.body;
  console.log(mac);
  // 1. Check if MAC is registered
  if (!employees[mac]) {
    return res.status(404).json({ message: "MAC address not found" });
  }
  // 2. Save check-in time
  // 3. Compare with 8:00 AM
  // 4. Return status

  res.json({ message: "Check-in successful!" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
