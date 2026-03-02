require("dotenv").config();
const express = require("express");
const app = express();
const getWorkSchedule = require("./utils/getWorkSchedule");
const isCheckInLate = require("./utils/isCheckInLate");
const isLeaveEarly = require("./utils/isLeaveEarly");
const getTodayDate = require("./utils/getTodayDate");
const getEmployeeData = require("./utils/getEmployeeData");
const insertStatus = require("./utils/insertStatus");
const isWeekend = require("./utils/isWeekend");
const getAttendanceStatus = require("./utils/getAttendanceStatus");
const updateStatus = require("./utils/updateStatus");
const addMinutesToTime = require("./utils/addMinutesToTime");

app.use(express.json());
app.set("trust proxy", true);

//xử lí check in
app.post("/checkin", async (req, res) => {
  const companyIp = process.env.COMPANY_IP.split(",");
  const { mac } = req.body;
  const userIp = req.ip;

  if (!companyIp.includes(userIp)) {
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

  console.log(userIp, mac, employeeData, workSchedule);

  const workStartTime = workSchedule.work_start_time;
  const lateMinutes = workSchedule.late_threshold_minutes;
  const finalWorkTime = addMinutesToTime(workStartTime, lateMinutes);
  const isLate = isCheckInLate(finalWorkTime);
  const todayDate = getTodayDate();
  insertStatus(employeeData, todayDate, isLate);

  if (isLate) {
    return res.status(400).json({ message: "Check-in late!" });
  }
  res.json({ message: "Check-in successful!" });
});

//xử lí check out
app.post("/checkout", async (req, res) => {
  const companyIp = process.env.COMPANY_IP.split(",");
  const userIp = req.ip;
  const { mac } = req.body;

  if (!companyIp.includes(userIp)) {
    return res.status(400).json({ message: "Invalid IP address" });
  }

  const employeeData = await getEmployeeData(mac);
  if (!employeeData) {
    return res.status(404).json({ message: "Employee not found" });
  }

  let workSchedule = isWeekend()
    ? await getWorkSchedule("weekend")
    : await getWorkSchedule("in_week");

  console.log(userIp, mac, employeeData);

  const leaveEarly = isLeaveEarly(workSchedule.work_end_time);
  const status = leaveEarly ? "leave_early" : undefined;

  const todayDate = getTodayDate();
  updateStatus(employeeData, todayDate, status);

  res.json({ message: "Check-out successful!" });
});

//lấy thông tin nhân viên và trạng thái check in/out
app.post("/get-info", async (req, res) => {
  const companyIp = process.env.COMPANY_IP.split(",");
  const { mac } = req.body;
  const userIp = req.ip;

  if (!companyIp.includes(userIp)) {
    return res.status(400).json({ message: "Invalid IP address" });
  }

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

  console.log(userIp, mac, employeeData, workSchedule, attendanceStatus);

  res.json({
    message: "Get info successful!",
    employeeData,
    workSchedule,
    attendanceStatus,
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
