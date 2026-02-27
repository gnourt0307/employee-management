const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

function isCheckInLate(workTime) {
  const format = "HH:mm:ss";

  const now = dayjs(); // keep as Dayjs object
  const target = dayjs(workTime, format);

  if (now.isAfter(target)) {
    return true;
  }

  return false;
}

module.exports = isCheckInLate;
