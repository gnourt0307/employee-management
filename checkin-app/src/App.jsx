import React, { useState, useEffect } from "react";
import "./index.css";
import Clock from "./utilsComponent/Clock";
import dayjs from "dayjs";
import compareWithNow from "./utils/compareWithNow";

function App() {
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState("");

  //xử lí check in/out
  const handleCheckInAndCheckOut = async (type) => {
    setIsLoading(true);
    setStatus("");

    try {
      const mac = await window.api.getMacAddress();
      const response = await fetch(`http://localhost:3000/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mac }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`${result.message}`);
      } else {
        setStatus(`${result.message}`);
      }

      setIsClickable(false);
    } catch (error) {
      console.error(`${type} error:`, error);
      setStatus("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  //lấy thông tin nhân viên và trạng thái check in/out
  const fetchInfo = async () => {
    try {
      const mac = await window.api.getMacAddress();
      const response = await fetch("http://localhost:3000/get-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mac }),
      });
      const result = await response.json();

      const { employeeData, workSchedule, attendanceStatus } = result;

      if (response.ok) {
        setName(employeeData.employee.full_name);
      }

      //Button clickable at 7AM
      const checkInStatus = compareWithNow("07:00:00");
      if (checkInStatus === "before") {
        setIsClickable(false);
      } else {
        setIsClickable(true);
      }

      //check if status has already been checked in
      if (attendanceStatus === undefined) {
        setIsClickable(true);
      } else if (
        attendanceStatus.status === "present" ||
        attendanceStatus.status === "late" ||
        attendanceStatus.status === "absent"
      ) {
        setIsClickable(false);
        setCheckInStatus(attendanceStatus.status);
      }

      //Make button clickable after work end time
      if (
        attendanceStatus &&
        !attendanceStatus.check_out_time &&
        (attendanceStatus.status === "present" ||
          attendanceStatus.status === "late")
      ) {
        const checkOutStatus = compareWithNow(workSchedule.work_end_time);
        if (checkOutStatus === "after") {
          setIsClickable(true);
        }
      }
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1 className="title">{name ? `Xin chào ${name}` : "Xin chào"}</h1>
        <p className="subtitle">
          Bây giờ là <Clock />
        </p>

        <div className="action-area">
          <button
            className={`checkin-btn ${isLoading ? "loading" : ""}`}
            onClick={
              checkInStatus === "present" || checkInStatus === "late"
                ? () => handleCheckInAndCheckOut("checkout")
                : () => handleCheckInAndCheckOut("checkin")
            }
            disabled={isLoading || !isClickable}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : checkInStatus === "present" || checkInStatus === "late" ? (
              "Check Out"
            ) : (
              "Check In"
            )}
          </button>
        </div>

        {status && (
          <div
            className={`status-message ${status.includes("successful") ? "success" : "error"}`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
