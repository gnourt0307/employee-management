require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function getEmployeeData(mac) {
  const { data, error } = await supabase
    .from("devices")
    .select(
      `
      id,
      mac_address,
      employee:employees (
        id,
        employee_code,
        full_name,
        position,
        status
      )
    `,
    )
    .eq("mac_address", mac)
    .single();

  if (error) {
    console.error("Error fetching employee data:", error);
    return null;
  }

  return data;
}

module.exports = getEmployeeData;
