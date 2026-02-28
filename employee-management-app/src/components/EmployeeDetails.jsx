import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function EmployeeDetails({ employee, onBack }) {
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.id) {
      fetchAttendance();
    }
  }, [employee]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employee.id)
      .order("work_date", { ascending: false });

    if (error) {
      console.error("Error fetching attendance:", error);
    } else {
      setAttendance(data || []);
    }
    setLoading(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "-";
    return new Date(isoStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  return (
    <div className="details-view">
      <button className="btn-back" onClick={onBack}>
        {t("backToEmployees")}
      </button>

      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">
            {employee.full_name} - {t("attendanceHistory")}
          </h2>
          <p className="subtitle">
            {employee.employee_code} | {employee.position} | {t("hireDate")}:{" "}
            {employee.hire_date}
          </p>
        </div>

        <div className="table-container">
          {loading ? (
            <p>{t("loading")}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("checkIn")}</th>
                  <th>{t("checkOut")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      {t("noAttendance")}
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.work_date}</td>
                      <td>{formatDate(record.check_in_time)}</td>
                      <td>{formatDate(record.check_out_time)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            record.status === "present"
                              ? !record.check_out_time
                                ? "status-in-progress"
                                : "status-active"
                              : record.status === "late"
                                ? !record.check_out_time
                                  ? "status-in-progress"
                                  : "status-late"
                                : "status-inactive"
                          }`}
                        >
                          {record.status === "present"
                            ? t("active")
                            : record.status === "late"
                              ? "Late"
                              : t("inactive")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
