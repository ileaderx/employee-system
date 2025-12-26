"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear JWT token
    router.push("/login");            // Redirect to login
  };

  // Auto-logout after 1 minute (60,000 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogout();
      alert("You have been logged out due to inactivity ⏱️");
    }, 60000);

    // Clear timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/employees" className="p-4 bg-gray-100 rounded hover:bg-gray-200 transition text-center">
          Employee Master
        </Link>
        <Link href="/attendance" className="p-4 bg-gray-100 rounded hover:bg-gray-200 transition text-center">
          Attendance
        </Link>
        <Link href="/report" className="p-4 bg-gray-100 rounded hover:bg-gray-200 transition text-center">
          Report
        </Link>
      </div>
    </div>
  );
}
