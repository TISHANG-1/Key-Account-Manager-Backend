export const convertToUTC = (dateString) => {
  const localDate = new Date(dateString);
  if (isNaN(localDate.getTime())) {
    throw new Error("Invalid date input");
  }

  const utcYear = localDate.getUTCFullYear();
  const utcMonth = localDate.getUTCMonth() + 1;
  const utcDay = localDate.getUTCDate();
  const utcHours = localDate.getUTCHours();
  const utcMinutes = localDate.getUTCMinutes();
  const utcSeconds = localDate.getUTCSeconds();

  return `${utcYear}-${String(utcMonth).padStart(2, "0")}-${String(
    utcDay
  ).padStart(2, "0")}T${String(utcHours).padStart(2, "0")}:${String(
    utcMinutes
  ).padStart(2, "0")}:${String(utcSeconds).padStart(2, "0")}Z`;
};

export const getNextDateUTC = (currentDate, frequency) => {
  if (!currentDate || !frequency) {
    throw new Error("Both currentDate and frequency are required.");
  }

  const date = new Date(currentDate);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided.");
  }

  switch (frequency.toLowerCase()) {
    case "daily":
      date.setUTCDate(date.getUTCDate() + 1); // Add 1 day
      break;
    case "weekly":
      date.setUTCDate(date.getUTCDate() + 7); // Add 7 days
      break;
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + 1); // Add 1 month
      break;
    default:
      throw new Error(
        "Invalid frequency. Use 'daily', 'weekly', or 'monthly'."
      );
  }

  return date.toISOString();
};
