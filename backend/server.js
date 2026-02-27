require("dotenv").config();
const express = require("express");
const app = express();
const { createClient } = require("@supabase/supabase-js");

app.use(express.json());
app.set("trust proxy", true);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

app.post("/checkin", async (req, res) => {
  const companyIp = process.env.COMPANY_IP;
  const userIp = req.ip;

  if (userIp !== "::1") {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  res.json({ message: "Check-in successful!" });
});

app.post("/get-info", async (req, res) => {
  const { mac } = req.body;

  if (!mac) {
    return res.status(400).json({ message: "MAC address not found" });
  }

  const { data, error } = await supabase
    .from("devices")
    .select(
      `
      id,
      mac_address,
      employee:employees (
        id,
        employee_code,
        full_name,
        position,
        status
      )
    `,
    )
    .eq("mac_address", mac)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Device not found" });
  }

  res.json({
    message: "Employee found",
    employee: data.employee,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
