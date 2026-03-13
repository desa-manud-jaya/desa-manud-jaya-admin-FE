"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { LogoutModal } from "./logout-modal";
import {
  clearAuthSessionCookie,
  getAuthSessionFromBrowser,
  type AuthSession,
} from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = getAuthSessionFromBrowser();
    setCurrentUser(session);
    setIsReady(true);
  }, []);

  const handleLogout = () => {
    clearAuthSessionCookie();
    setLogoutModalOpen(false);
    console.log("Logging out...");
    router.replace("/login");
    router.refresh();
  };

  if (!isReady) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        role={currentUser?.role}
        accountStatus={currentUser?.accountStatus}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      <Header
        user={currentUser}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

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