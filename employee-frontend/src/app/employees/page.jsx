"use client";
import { useEffect, useState } from "react";
import API from "../services/api";
import ProtectedRoute from "../../../components/ProtectedRoute";

// Helper to format date to DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Convert DD-MM-YYYY to YYYY-MM-DD for backend
const parseDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.employeeCode) newErrors.employeeCode = true;
    if (!form.nameEn) newErrors.nameEn = true;
    if (!form.nameAr) newErrors.nameAr = false;
    if (!form.dob) newErrors.dob = true;
    if (!form.doj) newErrors.doj = true;
    if (!form.salary) newErrors.salary = false;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const load = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data.map(emp => ({
        ...emp,
        dob: formatDate(emp.dob),
        doj: formatDate(emp.doj)
      })));
    } catch {
      setMessage("Error loading employees ❌");
    }
  };

  useEffect(() => { load(); }, []);

  const saveEmployee = async () => {
    if (!validate()) {
      setMessage("Please fill all required fields ❌");
      return;
    }

    try {
      const payload = {
        ...form,
        dob: parseDate(form.dob),
        doj: parseDate(form.doj)
      };

      if (editingId) {
        await API.put(`/employees/${editingId}`, payload);
        setEditingId(null);
        setMessage("Employee updated ✅");
      } else {
        await API.post("/employees", payload);
        setMessage("Employee added ✅");
      }

      setForm({});
      setErrors({});
      load();
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      if (err.response) setMessage(err.response.data.message || "Server error ❌");
      else setMessage("Network error ❌");
    }
  };

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

  const deleteEmployee = async (id) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await API.delete(`/employees/${id}`);
      setMessage("Employee deleted ✅");
      load();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Employee Master</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-300 text-gray-700 px-4 py-2 mb-4 rounded cursor-pointer hover:bg-gray-400 transition"
        >
          Back
        </button>
        {/* Form */}
        <div className="grid md:grid-cols-3 gap-2 mb-4">
          {[
            { key: "employeeCode", label: "Employee Code" },
            { key: "nameEn", label: "Name EN" },
            { key: "nameAr", label: "Name AR (Optional)" },
            { key: "dob", label: "DOB" },
            { key: "doj", label: "DOJ" },
            { key: "salary", label: "Salary (Optional)" },
          ].map(f => (
            <div key={f.key}>
              <label className="flex flex-col">{f.label + (f.label.includes("(Optional)") ? "" : " *")}</label>
              <input
                type={f.key.includes("dob") || f.key.includes("doj") ? "text" : "text"}
                placeholder={f.label}
                value={form[f.key] || ""}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                
                className={`border p-2 rounded ${errors[f.key] ? "border-red-500" : ""}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={saveEmployee}
          className={`mb-4 px-4 py-2 rounded cursor-pointer transition ${editingId ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {editingId ? "Update Employee" : "Add Employee"}
        </button>

        {message && (
          <div className="p-2 mb-4 bg-green-100 text-green-800 rounded">{message}</div>
        )}

        {/* Table */}
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
                <tr key={emp.id} className={`border-b hover:bg-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="p-3">{emp.employeeCode}</td>
                  <td className="p-3">{emp.nameEn}</td>
                  <td className="p-3">{emp.nameAr}</td>
                  <td className="p-3">{emp.dob}</td>
                  <td className="p-3">{emp.doj}</td>
                  <td className="p-3">{emp.salary}</td>
                  <td className="p-3 space-x-2">
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => editEmployee(emp)}>Edit</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteEmployee(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
