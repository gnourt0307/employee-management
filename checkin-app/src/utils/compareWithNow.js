import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function compareWithNow(timeString) {
  const now = dayjs();
  const target = dayjs(timeString, "HH:mm:ss");

  if (now.isBefore(target)) return "before";
  else return "after";
}

export default compareWithNow;
