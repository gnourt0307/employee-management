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

  const handleCheckIn = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      const mac = await window.api.getMacAddress();
      const response = await fetch("http://localhost:3000/checkin", {
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
      console.error("Check-in error:", error);
      setStatus("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      const mac = await window.api.getMacAddress();
      const response = await fetch("http://localhost:3000/checkout", {
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
      console.error("Check-out error:", error);
      setStatus("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

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
      if (response.ok) {
        setName(result.employee.full_name);
      }

      const checkInStatus = compareWithNow("00:00:00");
      if (checkInStatus === "before") {
        setIsClickable(false);
      } else {
        setIsClickable(true);
      }

      if (result.checkInStatus === undefined) {
        setIsClickable(true);
      } else if (result.checkInStatus.status === "present") {
        setIsClickable(false);
        setCheckInStatus("present");
      }

      if (result.checkInStatus.status === "present") {
        const checkOutStatus = compareWithNow(result.schedule.work_end_time);
        console.log(checkOutStatus);
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
              checkInStatus === "present" ? handleCheckOut : handleCheckIn
            }
            disabled={isLoading || !isClickable}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : checkInStatus === "present" ? (
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
