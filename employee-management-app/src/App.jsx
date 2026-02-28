import React, { useState } from "react";
import EmployeeList from "./components/EmployeeList";
import InsertData from "./components/InsertData";
import WorkSchedule from "./components/WorkSchedule";
import DailyAttendance from "./components/DailyAttendance";
import { LanguageProvider, useLanguage } from "./utils/LanguageContext";
import "./index.css";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("employees");
  const { t, lang, toggleLanguage } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case "employees":
        return <EmployeeList />;
      case "insert":
        return <InsertData />;
      case "schedule":
        return <WorkSchedule />;
      case "attendance":
        return <DailyAttendance />;
      default:
        return <EmployeeList />;
    }
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo-container">
          <h1 className="logo">{t("adminDashboard")}</h1>
        </div>
        <ul className="nav-links">
          <li
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            {t("employees")}
          </li>
          <li
            className={activeTab === "insert" ? "active" : ""}
            onClick={() => setActiveTab("insert")}
          >
            {t("insertData")}
          </li>
          <li
            className={activeTab === "schedule" ? "active" : ""}
            onClick={() => setActiveTab("schedule")}
          >
            {t("workSchedule")}
          </li>
          <li
            className={activeTab === "attendance" ? "active" : ""}
            onClick={() => setActiveTab("attendance")}
          >
            {t("dailyAttendance")}
          </li>
        </ul>
        <div className="language-toggle">
          <button onClick={toggleLanguage} className="lang-btn">
            {lang === "vi" ? "Tiếng Việt" : "English"}
          </button>
        </div>
      </nav>
      <main className="content">{renderContent()}</main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  );
}

export default App;
