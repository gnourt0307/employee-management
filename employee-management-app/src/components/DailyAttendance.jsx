import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function DailyAttendance() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyAttendance();
    }
  }, [selectedDate]);

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      // Fetch all active employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id, employee_code, full_name, position")
        .eq("status", "active")
        .order("full_name");

      if (empError) throw empError;

      // Fetch attendance for the specific date
      const { data: attendances, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .eq("work_date", selectedDate);

      if (attError) throw attError;

      // Merge data
      const mergedData = employees.map((emp) => {
        const att = attendances?.find((a) => a.employee_id === emp.id);
        return {
          ...emp,
          attendance: att || null,
        };
      });

      setAttendanceData(mergedData);
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return "-";
    return new Date(isoStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const getStatusBadge = (att) => {
    if (!att) {
      return (
        <span className="status-badge status-inactive">{t("absent")}</span>
      );
    }

    if (att.status === "late") {
      return (
        <span
          className={`status-badge ${!att.check_out_time ? "status-in-progress" : "status-late"}`}
        >
          {t("late")} {att.late_minutes > 0 ? `(+${att.late_minutes}m)` : ""}
        </span>
      );
    }

    return (
      <span
        className={`status-badge ${!att.check_out_time ? "status-in-progress" : "status-active"}`}
      >
        {t("onTime")}
      </span>
    );
  };

  return (
    <div className="card">
      <div
        className="card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="card-title">{t("dailyAttendance")}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ margin: 0 }}>{t("selectDate")}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-main)",
            }}
          />
        </div>
      </div>
      <div className="table-container">
        {loading ? (
          <p style={{ padding: "1rem" }}>{t("loading")}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("code")}</th>
                <th>{t("name")}</th>
                <th>{t("position")}</th>
                <th>{t("checkInTime")}</th>
                <th>{t("checkOutTime")}</th>
                <th>{t("attendanceStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    {t("noEmployees")}
                  </td>
                </tr>
              ) : (
                attendanceData.map((record) => (
                  <tr key={record.id}>
                    <td>{record.employee_code}</td>
                    <td>{record.full_name}</td>
                    <td>{record.position}</td>
                    <td>{formatTime(record.attendance?.check_in_time)}</td>
                    <td>{formatTime(record.attendance?.check_out_time)}</td>
                    <td>{getStatusBadge(record.attendance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
