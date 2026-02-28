require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function getStatus(employeeData, todayDate) {
  const { data: attendanceStatus, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .eq("work_date", todayDate)
    .eq("employee_id", employeeData.employee.id)
    .single();

  if (attendanceError) {
    console.error("Error fetching attendance status:", attendanceError);
    return null;
  }

  return attendanceStatus;
}

module.exports = getStatus;
