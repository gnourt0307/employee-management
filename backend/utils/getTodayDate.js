function getTodayDate() {
  const today = new Date();
  const vnDate = new Date(
    today.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );

  const formatted =
    vnDate.getFullYear() +
    "-" +
    String(vnDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(vnDate.getDate()).padStart(2, "0");

  return formatted;
}

module.exports = getTodayDate;
