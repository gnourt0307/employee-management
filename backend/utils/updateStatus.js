require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function updateStatus(employeeData, todayDate) {
  const { data, error } = await supabase
    .from("attendance")
    .update({
      check_out_time: new Date().toISOString(),
    })
    .eq("employee_id", employeeData.employee.id)
    .eq("work_date", todayDate)
    .single();

  if (error) {
    console.log("Update error:", error);
  } else {
    console.log("Check-out success:", data);
  }

  return data;
}

module.exports = updateStatus;
