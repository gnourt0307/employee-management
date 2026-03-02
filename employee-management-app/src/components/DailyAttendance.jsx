import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function DailyAttendance() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const vnDate = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    );
    const y = vnDate.getFullYear();
    const m = String(vnDate.getMonth() + 1).padStart(2, "0");
    const d = String(vnDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyAttendance();

      // Subscribe to real-time changes
      const attendanceSubscription = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "attendance",
            filter: `work_date=eq.${selectedDate}`,
          },
          (payload) => {
            console.log("Realtime Update received!", payload);
            fetchDailyAttendance();
          },
        )
        .subscribe();

      // Cleanup subscription on unmount or date change
      return () => {
        supabase.removeChannel(attendanceSubscription);
      };
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
      // Small timeout to prevent UI flashing if fetching is very fast
      setTimeout(() => setLoading(false), 300);
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

    if (att.status === "leave_early") {
      return (
        <span
          className={`status-badge ${!att.check_out_time ? "status-in-progress" : "status-leave-early"}`}
        >
          {t("leaveEarly")}
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
          <button
            onClick={fetchDailyAttendance}
            disabled={loading}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-main)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
            title="Reload"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
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
