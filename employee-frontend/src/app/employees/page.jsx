"use client";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Load employees
  const load = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch {
      setMessage("Error loading employees");
    }
  };

  useEffect(() => { load(); }, []);

  // Add or Update Employee
  const saveEmployee = async () => {
    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, form);
        setEditingId(null);
        setMessage("Employee updated ✅");
      } else {
        await API.post("/employees", form);
        setMessage("Employee added ✅");
      }
      setForm({});
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Error saving employee ❌");
    }
  };

  // Edit Employee
  const editEmployee = (emp) => {
    setForm({
      employeeCode: emp.employeeCode,
      nameEn: emp.nameEn,
      nameAr: emp.nameAr,
      dob: emp.dob,
      doj: emp.doj,
      salary: emp.salary,
    });
    setEditingId(emp.id);
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await API.delete(`/employees/${id}`);
      setMessage("Employee deleted ✅");
      load();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Employee Master</h1>

      {/* Form */}
      <div className="grid md:grid-cols-3 gap-2 mb-4">
        {["employeeCode", "nameEn", "nameAr", "dob", "doj", "salary"].map(f => (
          <input
            key={f}
            placeholder={f}
            value={form[f] || ""}
            className="border p-2 rounded"
            onChange={e => setForm({ ...form, [f]: e.target.value })}
          />
        ))}
      </div>
      {editingId ? "Update Employee" &&
        <button
          onClick={saveEmployee}
          className="bg-yellow-500 text-white px-4 py-2 mb-4 rounded cursor-pointer hover:bg-yellow-600 transition"
        >
          Update Employee
        </button> :

        "Add Employee" && <button
          onClick={saveEmployee}
          className="bg-green-600 text-white px-4 py-2 mb-4 rounded cursor-pointer hover:bg-green-700 transition"
        >
          Add Employee
        </button>}


      {message && (
        <div className="p-2 mb-4 bg-green-100 text-green-800 rounded">{message}</div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Name EN</th>
              <th className="p-3 text-left">Name AR</th>
              <th className="p-3 text-left">DOB</th>
              <th className="p-3 text-left">DOJ</th>
              <th className="p-3 text-left">Salary</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr
                key={emp.id}
                className={`border-b hover:bg-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="p-3">{emp.employeeCode}</td>
                <td className="p-3">{emp.nameEn}</td>
                <td className="p-3">{emp.nameAr}</td>
                <td className="p-3">{emp.dob}</td>
                <td className="p-3">{emp.doj}</td>
                <td className="p-3">{emp.salary}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
                    onClick={() => editEmployee(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded cursor-pointer"
                    onClick={() => deleteEmployee(emp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {employees.map(emp => (
          <div key={emp.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <p className="font-semibold text-blue-600">{emp.nameEn}</p>
            <p className="text-gray-500">Code: {emp.employeeCode}</p>
            <p className="text-gray-500">Name AR: {emp.nameAr}</p>
            <p className="text-gray-500">DOB: {emp.dob}</p>
            <p className="text-gray-500">DOJ: {emp.doj}</p>
            <p className="text-gray-500">Salary: {emp.salary}</p>
            <div className="mt-2 space-x-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
                onClick={() => editEmployee(emp)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-2 py-1 rounded cursor-pointer"
                onClick={() => deleteEmployee(emp.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
