import React, { createContext, useState, useContext } from "react";

const translations = {
  vi: {
    adminDashboard: "Dashboard",
    employees: "Nhân Viên",
    insertData: "Thêm Dữ Liệu",
    workSchedule: "Lịch Làm Việc",
    welcome: "Chào mừng đến với Bảng Điều Khiển",
    selectTab: "Chọn một tab từ thanh bên để bắt đầu.",
    loading: "Đang tải...",
    // EmployeeList
    employeeList: "Danh Sách Nhân Viên",
    code: "Mã Nhân Viên",
    name: "Họ Tên",
    position: "Vị Trí",
    salary: "Lương",
    status: "Trạng Thái",
    actions: "Hành Động",
    noEmployees: "Không tìm thấy nhân viên",
    confirmDelete: `Bạn có chắc chắn muốn xóa nhân viên này không? \nHành động này sẽ xóa toàn bộ thiết bị và dữ liệu điểm danh liên quan.`,
    deleteSuccess: "Đã xóa nhân viên thành công.",
    deleteError: "Lỗi khi xóa nhân viên.",
    editEmployee: "Sửa Thông Tin NV",
    updateSuccess: "Cập nhật nhân viên thành công!",
    updateError: "Cập nhật thất bại.",
    updateButton: "Cập nhật",
    // EmployeeDetails
    backToEmployees: "← Quay lại danh sách",
    attendanceHistory: "Lịch Sử Điểm Danh",
    hireDate: "Ngày vào làm",
    date: "Ngày",
    checkIn: "Giờ Vào",
    checkOut: "Giờ Ra",
    noAttendance: "Không tìm thấy dữ liệu điểm danh",
    // InsertData
    insertEmployeeDevice: "Thêm Nhân Viên & Thiết Bị",
    employeeDetails: "Thông Tin Nhân Viên",
    deviceDetails: "Thông Tin Thiết Bị",
    dob: "Ngày Sinh",
    deviceName: "Tên Thiết Bị (VD: PC-01)",
    macAddress: "Địa chỉ MAC",
    inserting: "Đang thêm...",
    insertButton: "Thêm Dữ Liệu",
    macExists: "Địa chỉ MAC này đã được đăng ký cho thiết bị khác.",
    insertSuccess: "Thêm nhân viên và thiết bị thành công!",
    insertError: "Đã xảy ra lỗi khi thêm dữ liệu.",
    active: "Đang làm việc",
    inactive: "Đã nghỉ việc",
    // WorkSchedule
    manageSchedule: "Quản Lý Lịch Làm Việc",
    dayType: "Loại Ngày Làm Việc",
    weekday: "Ngày thường (in_week)",
    weekend: "Cuối tuần (weekend)",
    startTime: "Giờ Bắt Đầu (HH:MM:SS)",
    endTime: "Giờ Kết Thúc (HH:MM:SS)",
    lateThreshold: "Cho Phép Đi Trễ (Phút)",
    effectiveFrom: "Áp Dụng Từ Ngày (Tuỳ chọn)",
    effectiveTo: "Áp Dụng Đến Ngày (Tuỳ chọn)",
    saving: "Đang lưu...",
    saveSchedule: "Lưu Lịch Lịch",
    currentSchedules: "Lịch Làm Việc Hiện Tại",
    lateMins: "Trễ (phút)",
    noSchedules: "Chưa có lịch làm việc",
    scheduleSuccess: "Lưu lịch làm việc thành công!",
    scheduleError: "Lỗi khi lưu lịch làm việc.",
    // DailyAttendance
    dailyAttendance: "Điểm Danh Hàng Ngày",
    selectDate: "Chọn Ngày",
    searchDate: "Xem Điểm Danh",
    attendanceStatus: "Trạng Thái Điểm Danh",
    checkInTime: "Giờ Vào",
    checkOutTime: "Giờ Ra",
    lateMinutes: "Đi Trễ (phút)",
    present: "Có Mặt",
    absent: "Vắng Mặt",
    onTime: "Đúng Giờ",
    late: "Đi Trễ",
  },
  en: {
    adminDashboard: "Dashboard",
    employees: "Employees",
    insertData: "Insert Data",
    workSchedule: "Work Schedule",
    welcome: "Welcome to the Admin Dashboard",
    selectTab: "Select a tab from the sidebar to begin.",
    loading: "Loading...",
    // EmployeeList
    employeeList: "Employee List",
    code: "Code",
    name: "Name",
    position: "Position",
    salary: "Salary",
    status: "Status",
    actions: "Actions",
    noEmployees: "No employees found",
    confirmDelete:
      "Are you sure you want to delete this employee? This will also delete all associated devices and attendance records.",
    deleteSuccess: "Employee deleted successfully.",
    deleteError: "Error deleting employee.",
    editEmployee: "Edit Employee",
    updateSuccess: "Employee updated successfully!",
    updateError: "Update failed.",
    updateButton: "Update",
    // EmployeeDetails
    backToEmployees: "← Back to Employees",
    attendanceHistory: "Attendance History",
    hireDate: "Hire Date",
    date: "Date",
    checkIn: "Check In",
    checkOut: "Check Out",
    noAttendance: "No attendance records found",
    // InsertData
    insertEmployeeDevice: "Insert Employee & Device Data",
    employeeDetails: "Employee Details",
    deviceDetails: "Device Details",
    dob: "Date of Birth",
    deviceName: "Device Name (e.g. PC-01)",
    macAddress: "MAC Address",
    deviceActive: "Device Active?",
    inserting: "Inserting...",
    insertButton: "Insert Data",
    macExists: "This MAC address is already registered to another device.",
    insertSuccess: "Employee and device data inserted successfully!",
    insertError: "An error occurred during insertion.",
    active: "Active",
    inactive: "Inactive",
    // WorkSchedule
    manageSchedule: "Manage Work Schedule",
    dayType: "Work Day Type",
    weekday: "Weekday (in_week)",
    weekend: "Weekend (weekend)",
    startTime: "Start Time (HH:MM:SS)",
    endTime: "End Time (HH:MM:SS)",
    lateThreshold: "Late Threshold (Minutes)",
    effectiveFrom: "Effective From (Optional)",
    effectiveTo: "Effective To (Optional)",
    saving: "Saving...",
    saveSchedule: "Save Schedule",
    currentSchedules: "Current Schedules",
    lateMins: "Late (mins)",
    noSchedules: "No schedules found",
    scheduleSuccess: "Work schedule saved successfully!",
    scheduleError: "Error saving work schedule.",
    // DailyAttendance
    dailyAttendance: "Daily Attendance",
    selectDate: "Select Date",
    searchDate: "View Attendance",
    attendanceStatus: "Attendance Status",
    checkInTime: "Check In Time",
    checkOutTime: "Check Out Time",
    lateMinutes: "Late (mins)",
    present: "Present",
    absent: "Absent",
    onTime: "On Time",
    late: "Late",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("vi"); // Default to Vietnamese

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "vi" ? "en" : "vi"));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
