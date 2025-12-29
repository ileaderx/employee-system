"use client";
import { useEffect, useState } from "react";
import API from "../services/api";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { formatDate, formatTime, getTotalTime } from "../../../utils/date";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export default function Report() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/attendance/report")
      .then(res => setData(res.data))
      .catch(() => console.error("Error loading report"));
  }, []);

  const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Attendance Report", 14, 15);

  const tableData = data.map(r => [
    r.nameEn,
    formatDate(r.date),
    formatTime(r.clockIn),
    formatTime(r.clockOut),
    getTotalTime(r.clockIn, r.clockOut)
  ]);

  autoTable(doc, {
    head: [["Employee", "Date", "Clock In", "Clock Out", "Total Time"]],
    body: tableData,
    startY: 20,
  });

  doc.save("Attendance_Report.pdf");
};

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Attendance Report</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-300 text-gray-700 px-4 py-2 mb-4 rounded cursor-pointer hover:bg-gray-400 transition"
        >
          back
        </button>
        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-4 py-2 mb-4 ml-4 rounded hover:bg-green-700 transition cursor-pointer"
        >
          Download PDF
        </button>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Clock In</th>
                <th className="p-3 text-left">Clock Out</th>
                <th className="p-3 text-left">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className={`border-b hover:bg-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="p-3">{r.nameEn}</td>
                  <td className="p-3">{formatDate(r.date)}</td>
                  <td className="p-3">{formatTime(r.clockIn)}</td>
                  <td className="p-3">{formatTime(r.clockOut)}</td>
                  <td className="p-3">{getTotalTime(r.clockIn, r.clockOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {data.map((r, i) => (
            <div key={i} className="p-4 border rounded-lg shadow-sm bg-white">
              <p className="font-semibold text-blue-600">{r.nameEn}</p>
              <p className="text-gray-500">Date: {formatDate(r.date)}</p>
              <p className="text-gray-500">Clock In: {formatTime(r.clockIn)}</p>
              <p className="text-gray-500">Clock Out: {formatTime(r.clockOut)}</p>
              <p className="text-gray-500">Total Time: {getTotalTime(r.clockIn, r.clockOut)}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
