const toDate = (str) => {
  // 2021-10-13
  let [yyyy, MM, dd] = str.split("-");
  return new Date(`${MM}/${dd}/${yyyy}`);
};

const isBetween = (checkInDateTime, checkOutDateTime, startDateTime, endDateTime) => {
  return (toDate(checkInDateTime) >= toDate(startDateTime) && toDate(checkInDateTime) <= toDate(endDateTime)) || (toDate(checkOutDateTime) >= toDate(startDateTime) && toDate(checkOutDateTime) <= toDate(endDateTime));
};

module.exports = {
  toDate,
  isBetween,
};
