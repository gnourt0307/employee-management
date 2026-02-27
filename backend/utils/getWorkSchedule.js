const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function getWorkSchedule(work_day) {
  const { data, error } = await supabase
    .from("work_schedules")
    .select("*")
    .eq("work_day", work_day)
    .single();

  if (error) {
    console.error("Error fetching work schedule:", error);
    return null;
  }

  console.log("Work Schedule Data:", data);
  return data;
}

module.exports = getWorkSchedule;
