const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

function isLeaveEarly(workTime) {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  // Create target time string: "YYYY-MM-DD HH:mm:ss"
  const targetTimeStr = `${now.format("YYYY-MM-DD")} ${workTime}`;

  // Parse in the specific timezone to avoid shifting issues
  const target = dayjs.tz(
    targetTimeStr,
    "YYYY-MM-DD HH:mm:ss",
    "Asia/Ho_Chi_Minh",
  );

  return now.isBefore(target);
}

module.exports = isLeaveEarly;
