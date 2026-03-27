"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Username atau password salah.");
    } else {
      router.push("/akun");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-tcb-black">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tcb-red/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
<div className="text-center mb-8">
<img src="/logo.png" alt="TCB Logo" className="h-16 w-auto mx-auto mb-3" />
<div className="w-10 h-0.5 bg-tcb-red mx-auto mt-2 mb-4" />
<p className="text-tcb-gray-400 text-sm">Masuk ke akun anggota</p>
</div>

        <form
          onSubmit={handleSubmit}
          className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl p-6 space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-tcb-gray-200 mb-2">
              Username
            </label>
            <input
              type="text"
              className="input"
              placeholder="masukkan username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-tcb-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-red w-full py-3 text-base"
            disabled={loading}
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>

          <p className="text-center text-xs text-tcb-gray-400">
            Belum punya akun? Hubungi admin TCB.
          </p>
        </form>
      </div>
    </div>
  );
}
