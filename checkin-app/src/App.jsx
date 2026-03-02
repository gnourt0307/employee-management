import React, { useState, useEffect } from "react";
import "./index.css";
import Clock from "./utilsComponent/Clock";
import compareWithNow from "./utils/compareWithNow";

function App() {
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState("");
  const [isGetInfoSuccess, setIsGetInfoSuccess] = useState(true);
  const [message, setMessage] = useState("");

  //xử lí check in/out
  const handleCheckInAndCheckOut = async (type) => {
    setIsLoading(true);
    setStatus("");

    try {
      const mac = await window.api.getMacAddress();
      const response = await fetch(
        `https://checkin-app-ncqz.onrender.com/${type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mac }),
        },
      );

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
      const response = await fetch(
        "https://checkin-app-ncqz.onrender.com/get-info",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mac }),
        },
      );
      const result = await response.json();
      if (result.message !== "Get info successful!") {
        setIsGetInfoSuccess(false);
        setMessage(result.message);
      }

      const { employeeData, attendanceStatus } = result;
      setName(employeeData.employee.full_name);

      let clickable = false;

      //check if status has already been checked in
      if (attendanceStatus === null) {
        clickable = true;
      } else if (attendanceStatus.status) {
        if (!attendanceStatus.check_out_time) {
          clickable = true;
        } else {
          clickable = false;
        }
        setCheckInStatus(attendanceStatus.status);
      }

      //Button clickable at 7AM
      if (compareWithNow("07:00:00") === "before") {
        clickable = false;
      }
      setIsClickable(clickable);
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
        {!isGetInfoSuccess ? (
          <div className="error-message">{message}</div>
        ) : (
          <>
            <h1 className="title">{name ? `Xin chào ${name}` : "Xin chào"}</h1>
            <p className="subtitle">
              Bây giờ là <Clock />
            </p>

            <div className="action-area">
              <button
                className={`checkin-btn ${isLoading ? "loading" : ""}`}
                onClick={
                  checkInStatus
                    ? () => handleCheckInAndCheckOut("checkout")
                    : () => handleCheckInAndCheckOut("checkin")
                }
                disabled={isLoading || !isClickable}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : checkInStatus ? (
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
          </>
        )}
      </div>

      <button
        className="reload-btn"
        onClick={() => window.location.reload()}
        title="Reload Application"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "6px", verticalAlign: "middle" }}
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        Reload
      </button>
    </div>
  );
}

export default App;
