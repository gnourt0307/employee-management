import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function InsertData() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    employee_code: "",
    full_name: "",
    date_of_birth: "",
    salary: "",
    position: "",
    hire_date: "",
    status: "active",
    device_name: "",
    mac_address: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Check if MAC address already exists
      const { data: existingDevice } = await supabase
        .from("devices")
        .select("id")
        .eq("mac_address", formData.mac_address)
        .single();

      if (existingDevice) {
        throw new Error(t("macExists"));
      }

      // Insert employee
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .insert([
          {
            employee_code: formData.employee_code,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            salary: parseFloat(formData.salary),
            position: formData.position,
            hire_date: formData.hire_date,
            status: formData.status,
          },
        ])
        .select()
        .single();

      if (empError) throw empError;

      // Insert device
      const { error: devError } = await supabase.from("devices").insert([
        {
          employee_id: empData.id,
          device_name: formData.device_name,
          mac_address: formData.mac_address.toLowerCase(),
          is_active: formData.is_active,
        },
      ]);

      if (devError) {
        // Rollback employee if device fails
        await supabase.from("employees").delete().eq("id", empData.id);
        throw devError;
      }

      setMessage({
        type: "success",
        text: t("insertSuccess"),
      });
      // Reset form
      setFormData({
        employee_code: "",
        full_name: "",
        date_of_birth: "",
        salary: "",
        position: "",
        hire_date: "",
        status: "active",
        device_name: "",
        mac_address: "",
        is_active: true,
      });
    } catch (error) {
      console.error("Insert error:", error);
      setMessage({
        type: "error",
        text: error.message || t("insertError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl">
      <div className="card-header">
        <h2 className="card-title">{t("insertEmployeeDevice")}</h2>
      </div>
      <div className="card-body">
        {message.text && (
          <div
            className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid-2col">
            <div className="form-section" style={{ borderBottom: "none" }}>
              <h3 className="section-title">{t("employeeDetails")}</h3>
              <div className="form-group full-width">
                <label>{t("code")}</label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("name")}</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("dob")}</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("salary")}</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("position")}</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("hireDate")}</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("status")}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
              </div>
            </div>
            <div className="form-section" style={{ borderBottom: "none" }}>
              <h3 className="section-title">{t("deviceDetails")}</h3>
              <div className="form-group full-width">
                <label>{t("deviceName")}</label>
                <input
                  type="text"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("macAddress")}</label>
                <input
                  type="text"
                  name="mac_address"
                  value={formData.mac_address}
                  onChange={handleChange}
                  placeholder="00-00-00-00-00-00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="full-width mt-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t("inserting") : t("insertButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
