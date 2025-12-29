"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirect if no token
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  return children;
}
