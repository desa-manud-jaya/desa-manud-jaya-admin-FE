"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginAndFetchVendor } from "@/store/slices/auth-slice";

type LoginFormState = {
  username: string;
  password: string;
};

type FormErrors = {
  username?: string;
  password?: string;
  general?: string;
};

export function AdminLoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const authState = useAppSelector((state) => state.auth);
  const { loading } = authState;

  const [form, setForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log("REDUX AUTH STATE UPDATED:", authState);
    console.log("REDUX STORED token:", authState.token);
    console.log("REDUX STORED isAuthenticated:", authState.isAuthenticated);
    console.log("REDUX STORED loginUser:", authState.loginUser);
    console.log("REDUX STORED vendorData:", authState.vendorData);
    console.log("REDUX STORED loading:", authState.loading);
    console.log("REDUX STORED error:", authState.error);
    console.log("REDUX STORED hydrated:", authState.hydrated);
  }, [authState]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Username wajib diisi.";
    }

    if (!form.password) {
      nextErrors.password = "Password wajib diisi.";
    }

    return nextErrors;
  };

  const handleChange = (field: keyof LoginFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
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

    console.log("LOGIN FORM PAYLOAD:", {
      username: form.username,
      password: form.password,
    });

    try {
      const resultAction = await dispatch(
        loginAndFetchVendor({
          username: form.username,
          password: form.password,
        })
      );

      console.log("DISPATCH RESULT ACTION:", resultAction);

      if (loginAndFetchVendor.fulfilled.match(resultAction)) {
        console.log("LOGIN + GET /vendor SUCCESS");
        console.log("FULFILLED PAYLOAD:", resultAction.payload);
        console.log("TOKEN FROM THUNK:", resultAction.payload.token);
        console.log("LOGIN USER FROM THUNK:", resultAction.payload.loginUser);
        console.log("VENDOR DATA FROM THUNK:", resultAction.payload.vendorData);

        router.replace("/dashboard");
        router.refresh();
      } else {
        console.log("LOGIN + GET /vendor FAILED");
        console.log("REJECTED PAYLOAD:", resultAction.payload);
        console.log("REJECTED ERROR:", resultAction.error);

        setErrors({
          general:
            typeof resultAction.payload === "string"
              ? resultAction.payload
              : "Login gagal",
        });
      }
    } catch (error) {
      console.error("HANDLE SUBMIT ERROR:", error);

      setErrors({
        general: "Terjadi kesalahan saat proses login.",
      });
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-sky-500">Portal Admin</p>
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
            Username
          </label>
          <Input
            type="text"
            placeholder="Masukkan username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className={
              errors.username ? "border-red-500 focus-visible:ring-red-200" : ""
            }
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-500">{errors.username}</p>
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

        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-sky-600"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>
    </div>
  );
}