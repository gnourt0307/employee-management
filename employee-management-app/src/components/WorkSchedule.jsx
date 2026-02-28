import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function WorkSchedule() {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    work_day: "in_week",
    work_start_time: "08:00:00",
    work_end_time: "17:00:00",
    late_threshold_minutes: 15,
    effective_from: "",
    effective_to: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("work_schedules")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching schedules:", error);
    } else {
      setSchedules(data || []);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // First check if the schedule exists
      const { data: existingData } = await supabase
        .from("work_schedules")
        .select("id")
        .eq("work_day", formData.work_day)
        .single();

      const schedulePayload = {
        work_day: formData.work_day,
        work_start_time: formData.work_start_time,
        work_end_time: formData.work_end_time,
        late_threshold_minutes: parseInt(formData.late_threshold_minutes),
        effective_from: formData.effective_from || null,
        effective_to: formData.effective_to || null,
      };

      let saveError;
      if (existingData) {
        // Update existing row
        const { error } = await supabase
          .from("work_schedules")
          .update(schedulePayload)
          .eq("id", existingData.id);
        saveError = error;
      } else {
        // Insert new row
        const { error } = await supabase
          .from("work_schedules")
          .insert([schedulePayload]);
        saveError = error;
      }

      if (saveError) throw saveError;

      setMessage({
        type: "success",
        text: t("scheduleSuccess"),
      });
      fetchSchedules();
    } catch (error) {
      console.error("Save error:", error);
      setMessage({
        type: "error",
        text: error.message || t("scheduleError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2col">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t("manageSchedule")}</h2>
        </div>
        <div className="card-body">
          {message.text && (
            <div
              className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
            >
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label>{t("dayType")}</label>
              <select
                name="work_day"
                value={formData.work_day}
                onChange={handleChange}
              >
                <option value="in_week">{t("weekday")}</option>
                <option value="weekend">{t("weekend")}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t("startTime")}</label>
              <input
                type="time"
                step="1"
                name="work_start_time"
                value={formData.work_start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("endTime")}</label>
              <input
                type="time"
                step="1"
                name="work_end_time"
                value={formData.work_end_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("lateThreshold")}</label>
              <input
                type="number"
                name="late_threshold_minutes"
                value={formData.late_threshold_minutes}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("effectiveFrom")}</label>
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t("effectiveTo")}</label>
              <input
                type="date"
                name="effective_to"
                value={formData.effective_to}
                onChange={handleChange}
              />
            </div>
            <div className="full-width mt-4">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t("saving") : t("saveSchedule")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t("currentSchedules")}</h2>
        </div>
        <div className="card-body p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("dayType")}</th>
                <th>{t("startTime")}</th>
                <th>{t("endTime")}</th>
                <th>{t("lateMins")}</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sch) => (
                <tr key={sch.id}>
                  <td>
                    {sch.work_day === "in_week" ? t("weekday") : t("weekend")}
                  </td>
                  <td>{sch.work_start_time}</td>
                  <td>{sch.work_end_time}</td>
                  <td>{sch.late_threshold_minutes}</td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    {t("noSchedules")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
