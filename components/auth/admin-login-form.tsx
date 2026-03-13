"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginWithDummy,
  setAuthSessionCookie,
  type LoginPayload,
  type UserRole,
} from "@/lib/auth";

type FormErrors = {
  email?: string;
  password?: string;
  role?: string;
  general?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminLoginForm() {
  const router = useRouter();

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
    role: "admin",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (!form.password) {
      nextErrors.password = "Password wajib diisi.";
    }

    if (!form.role) {
      nextErrors.role = "Role wajib dipilih.";
    }

    return nextErrors;
  };

  const handleChange = (field: keyof LoginPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "role" ? (value as UserRole) : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      console.log("LOGIN API PAYLOAD:", form);

      // TODO:
      // Saat API sudah tersedia, ganti blok dummy di bawah dengan fetch ke endpoint login.
      // Contoh:
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // const result = await response.json();
      // lalu cookie idealnya diset dari backend sebagai httpOnly cookie.

      const session = loginWithDummy(form);

      if (!session) {
        setErrors({
          general: "Email, password, atau role tidak cocok.",
        });
        return;
      }

      console.log("LOGIN SESSION:", session);

      setAuthSessionCookie(session);
      router.replace("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-500">Portal Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Masuk ke dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Login untuk mengakses manajemen mitra, paket wisata, dan persetujuan
          konten.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            type="email"
            placeholder="admin@manudjaya.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={
              errors.email ? "border-red-500 focus-visible:ring-red-200" : ""
            }
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`pr-12 ${
                errors.password
                  ? "border-red-500 focus-visible:ring-red-200"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Masuk sebagai
          </label>
          <select
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className={`h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ${
              errors.role ? "border-red-500" : "border-input"
            }`}
          >
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
          </select>
          {errors.role && (
            <p className="mt-2 text-sm text-red-500">{errors.role}</p>
          )}
        </div>

        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Dummy login</p>
        <p className="mt-2">Admin: admin@manudjaya.com / Admin123!</p>
        <p>Partner Draft: partner@manudjaya.com / Partner123!</p>
        <p>Partner Activated: bastian@manudjaya.com / Bastian123!</p>
      </div>
    </div>
  );
}
