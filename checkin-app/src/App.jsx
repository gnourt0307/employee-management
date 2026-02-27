import React, { useState, useEffect } from "react";
import "./index.css";
import Clock from "./utils/Clock";

function App() {
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        setStatus(`Success: ${result.message}`);
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setStatus("Error: Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchName = async () => {
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
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  useEffect(() => {
    fetchName();
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
            onClick={handleCheckIn}
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : "Check In"}
          </button>
        </div>

        {status && (
          <div
            className={`status-message ${status.startsWith("Success") ? "success" : "error"}`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
