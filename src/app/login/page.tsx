"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
      setError(res.error === "CredentialsSignin"
        ? "Username atau password salah."
        : res.error);
    } else {
      router.push("/akun");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-tcb-black">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tcb-red/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="TCB Logo"
            width={192}
            height={192}
            className="h-36 md:h-48 w-auto mx-auto mb-2"
            style={{
                filter: !isDark
                  ? "drop-shadow(0 1px 3px rgba(0,0,0,0.25)) drop-shadow(0 0 1px rgba(0,0,0,0.15))"
                  : "none",
              }}
            priority
          />
          <p className="text-tcb-gray-400 text-sm">Masuk ke akun anggota</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-tcb-gray-800 border border-tcb-gray-700 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-tcb-gray-200 mb-2">Username</label>
            <input type="text" className="input" placeholder="masukkan username"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              required autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-tcb-gray-200 mb-2">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} className="input pr-10"
                placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tcb-gray-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPass
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
          </div>
          <button type="submit" className="btn-red w-full py-3 text-base" disabled={loading}>
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
