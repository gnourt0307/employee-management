const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

function isCheckInLate(workTime) {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  const target = dayjs(
    now.format("YYYY-MM-DD") + " " + workTime,
    "YYYY-MM-DD HH:mm:ss",
  ).tz("Asia/Ho_Chi_Minh");

  return now.isAfter(target);
}

module.exports = isCheckInLate;
