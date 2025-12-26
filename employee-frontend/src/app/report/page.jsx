"use client";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Report() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/attendance/report")
      .then(res => setData(res.data))
      .catch(err => console.error("Error loading report"));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Attendance Report</h1>

      {/* Table for desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Clock In</th>
              <th className="p-3 text-left">Clock Out</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={i}
                className={`border-b hover:bg-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="p-3">{r.nameEn}</td>
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.clockIn}</td>
                <td className="p-3">{r.clockOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="md:hidden space-y-4">
        {data.map((r, i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm bg-white">
            <p className="font-semibold text-blue-600">{r.nameEn}</p>
            <p className="text-gray-500">Date: {r.date}</p>
            <p className="text-gray-500">Clock In: {r.clockIn}</p>
            <p className="text-gray-500">Clock Out: {r.clockOut}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
