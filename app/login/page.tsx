import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between bg-emerald-600 p-10 text-white">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em]">
              Desa Manud Jaya
            </p>
            <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
              Portal Admin & Mitra untuk mengelola konten wisata dan persetujuan.
            </h1>
            <p className="mt-4 max-w-md text-white/85">
              Kelola pendaftaran kemitraan, paket wisata, verifikasi eco, dan berbagai konten destinasi dari satu dashboard.
            </p>
          </div>

          <div className="text-sm text-white/80">
            © Portal Desa Manud Jaya
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}