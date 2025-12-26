"use client";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/employees")
      .then(res => setEmployees(res.data))
      .catch(() => setMessage("Error loading employees ❌"));
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const clockIn = async () => {
    if (!employeeId) return showMessage("Please select an employee ❌");
    try {
      await API.post("/attendance/clock-in", { employeeId });
      showMessage("Clock In Success ✅");
    } catch {
      showMessage("Error clocking in ❌");
    }
  };

  const clockOut = async () => {
    if (!employeeId) return showMessage("Please select an employee ❌");
    try {
      await API.post("/attendance/clock-out", { employeeId });
      showMessage("Clock Out Success ✅");
    } catch {
      showMessage("Error clocking out ❌");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Employee Attendance</h1>

      {/* Employee Selector */}
      <select
        value={employeeId}
        onChange={e => setEmployeeId(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      >
        <option value="">Select Employee</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.nameEn} ({emp.employeeCode})
          </option>
        ))}
      </select>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-4">
        <button
          onClick={clockIn}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Clock In
        </button>
        <button
          onClick={clockOut}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Clock Out
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded text-center">
          {message}
        </div>
      )}
    </div>
  );
}
