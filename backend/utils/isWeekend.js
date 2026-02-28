function isWeekend() {
  const day = new Date();
  const dayOfWeek = day.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  } else {
    return false;
  }
}

module.exports = isWeekend;
