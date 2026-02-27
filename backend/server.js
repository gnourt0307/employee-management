require("dotenv").config();
const express = require("express");
const app = express();
const { createClient } = require("@supabase/supabase-js");
const getWorkSchedule = require("./utils/getWorkSchedule");
const isCheckInLate = require("./utils/isCheckInLate");

app.use(express.json());
app.set("trust proxy", true);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

app.post("/checkin", async (req, res) => {
  const companyIp = process.env.COMPANY_IP;
  const userIp = req.ip;
  let workSchedule;

  if (userIp !== "::1") {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  const day = new Date().getDay();
  // if (day > 5) {
  //   workSchedule = await getWorkSchedule("weekend");
  // } else {
  //   workSchedule = await getWorkSchedule("in_week");
  // }

  workSchedule = await getWorkSchedule("testing");

  if (!workSchedule) {
    return res.status(404).json({ message: "Work schedule not found" });
  }

  const workStartTime = workSchedule.work_start_time;

  const isLate = isCheckInLate(workStartTime);
  console.log(isLate);
  console.log(workStartTime);

  if (isLate) {
    return res.status(400).json({ message: "Check-in late!" });
  }

  res.json({ message: "Check-in successful!" });
});

app.post("/checkout", async (req, res) => {
  const companyIp = process.env.COMPANY_IP;
  const userIp = req.ip;

  if (userIp !== "::1") {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  res.json({ message: "Check-out successful!" });
});

app.post("/get-info", async (req, res) => {
  const { mac } = req.body;
  console.log(mac);

  if (!mac) {
    return res.status(400).json({ message: "MAC address not found" });
  }

  const day = new Date().getDay();
  let workSchedule;
  // if (day > 5) {
  //   workSchedule = await getWorkSchedule("weekend");
  // } else {
  //   workSchedule = await getWorkSchedule("in_week");
  // }

  workSchedule = await getWorkSchedule("testing");

  const { data: deviceData, error: deviceError } = await supabase
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

  console.log(deviceData);

  const today = new Date();
  const todayDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  const { data: checkInStatus, error: checkInError } = await supabase
    .from("attendance")
    .select("*")
    .eq("work_date", todayDate)
    .eq("employee_id", deviceData.employee.id)
    .single();

  console.log(checkInStatus);

  if (deviceError || !deviceData || checkInError || !checkInStatus) {
    return res.status(404).json({ message: "Some errors have occurred" });
  }

  res.json({
    message: "Employee found",
    employee: deviceData.employee,
    schedule: workSchedule,
    checkInStatus: checkInStatus,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
