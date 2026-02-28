require("dotenv").config();
const express = require("express");
const app = express();
const getWorkSchedule = require("./utils/getWorkSchedule");
const isCheckInLate = require("./utils/isCheckInLate");
const getTodayDate = require("./utils/getTodayDate");
const getEmployeeData = require("./utils/getEmployeeData");
const insertStatus = require("./utils/insertStatus");
const isWeekend = require("./utils/isWeekend");
const getAttendanceStatus = require("./utils/getAttendanceStatus");
const updateStatus = require("./utils/updateStatus");

app.use(express.json());
app.set("trust proxy", true);

//xử lí check in
app.post("/checkin", async (req, res) => {
  const companyIp = process.env.COMPANY_IP;
  const { mac } = req.body;
  const userIp = req.ip;

  if (userIp !== "::1") {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  const employeeData = await getEmployeeData(mac);
  if (!employeeData) {
    return res.status(404).json({ message: "Employee not found" });
  }

  let workSchedule = isWeekend()
    ? await getWorkSchedule("weekend")
    : await getWorkSchedule("in_week");

  if (!workSchedule) {
    return res.status(404).json({ message: "Work schedule not found" });
  }

  const workStartTime = workSchedule.work_start_time;
  const isLate = isCheckInLate(workStartTime);
  const todayDate = getTodayDate();
  insertStatus(employeeData, todayDate, isLate);

  if (isLate) {
    return res.status(400).json({ message: "Check-in late!" });
  }
  res.json({ message: "Check-in successful!" });
});

//xử lí check out
app.post("/checkout", async (req, res) => {
  const companyIp = process.env.COMPANY_IP;
  const userIp = req.ip;
  const { mac } = req.body;

  if (userIp !== "::1") {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  const employeeData = await getEmployeeData(mac);
  if (!employeeData) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const todayDate = getTodayDate();
  updateStatus(employeeData, todayDate);

  res.json({ message: "Check-out successful!" });
});

//lấy thông tin nhân viên và trạng thái check in/out
app.post("/get-info", async (req, res) => {
  const { mac } = req.body;
  console.log(mac);

  if (!mac) {
    return res.status(400).json({ message: "MAC address not found" });
  }

  let workSchedule = isWeekend()
    ? await getWorkSchedule("weekend")
    : await getWorkSchedule("in_week");

  const employeeData = await getEmployeeData(mac);
  if (!employeeData) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const todayDate = getTodayDate();
  const attendanceStatus = await getAttendanceStatus(employeeData, todayDate);

  if (!attendanceStatus) {
    return res.status(404).json({ message: "Attendance status not found" });
  }

  res.json({
    employeeData,
    workSchedule,
    attendanceStatus,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
