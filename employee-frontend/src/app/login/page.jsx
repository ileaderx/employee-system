"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch {
      alert("Invalid login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 shadow rounded w-80">
        <h1 className="text-xl mb-4">Login</h1>
        <input className="border p-2 w-full mb-2" placeholder="Username"
          onChange={(e) => setUsername(e.target.value)} />
        <input type="password" className="border p-2 w-full mb-4" placeholder="Password"
          onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login} className="bg-blue-600 text-white w-full py-2 cursor-pointer rounded hover:bg-blue-700 transition">
          Login
        </button>
      </div>
    </div>
  );
}
