// utils/date.js
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(`1970-01-01T${timeString}`);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// Calculate total time in HH:MM:SS
export const getTotalTime = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return "";
  const start = new Date(`1970-01-01T${clockIn}`);
  const end = new Date(`1970-01-01T${clockOut}`);
  let diff = (end - start) / 1000; // seconds

  const hours = Math.floor(diff / 3600).toString().padStart(2, "0");
  diff %= 3600;
  const minutes = Math.floor(diff / 60).toString().padStart(2, "0");
  const seconds = Math.floor(diff % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
