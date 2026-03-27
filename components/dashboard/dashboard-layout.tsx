"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { LogoutModal } from "./logout-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/auth-slice";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const { hydrated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutModalOpen(false);
    console.log("Logging out...");
    router.replace("/login");
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />

      <Header onLogoutClick={() => setLogoutModalOpen(true)} />

      <main className="ml-[200px] pt-16">
        <div className="p-6">{children}</div>
      </main>

      <LogoutModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </div>
  );
}