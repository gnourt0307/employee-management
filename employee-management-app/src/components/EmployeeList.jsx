import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import EmployeeDetails from "./EmployeeDetails";
import EditEmployee from "./EditEmployee";
import { useLanguage } from "../utils/LanguageContext";

export default function EmployeeList() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching employees:", error);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (e, emp) => {
    e.stopPropagation(); // Prevent opening employee details

    if (window.confirm(t("confirmDelete"))) {
      try {
        setLoading(true);
        // Safely delete associated records first (if no cascade is set)
        await supabase.from("attendance").delete().eq("employee_id", emp.id);
        await supabase.from("devices").delete().eq("employee_id", emp.id);

        // Delete employee
        const { error: empError } = await supabase
          .from("employees")
          .delete()
          .eq("id", emp.id);

        if (empError) throw empError;

        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert(t("deleteError"));
      } finally {
        setLoading(false);
      }
    }
  };

  if (selectedEmployee) {
    return (
      <EmployeeDetails
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
      />
    );
  }

  if (editingEmployee) {
    return (
      <EditEmployee
        employee={editingEmployee}
        onBack={() => setEditingEmployee(null)}
        onSuccess={() => {
          setEditingEmployee(null);
          fetchEmployees();
        }}
      />
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{t("employeeList")}</h2>
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
                <th>{t("salary")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    {t("noEmployees")}
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="clickable-row"
                  >
                    <td>{emp.employee_code}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.position}</td>
                    <td>{emp.salary?.toLocaleString("vi-VN")}</td>
                    <td>
                      <span
                        className={`status-badge ${emp.status === "active" ? "status-active" : "status-inactive"}`}
                      >
                        {emp.status === "active" ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <button
                          className="btn-edit-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEmployee(emp);
                          }}
                          title="Edit Employee"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-danger-icon"
                          onClick={(e) => handleDelete(e, emp)}
                          title="Delete Employee"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
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
