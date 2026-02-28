require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function insertStatus(employeeData, todayDate, isLate) {
  const { data, error } = await supabase
    .from("attendance")
    .insert([
      {
        employee_id: employeeData.employee.id,
        work_date: todayDate,
        check_in_time: new Date().toISOString(),
        status: isLate ? "late" : "present",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("Insert error:", error);
  } else {
    console.log("Check-in success:", data);
  }
}

module.exports = insertStatus;
