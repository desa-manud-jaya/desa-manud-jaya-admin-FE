"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { LogoutModal } from "./logout-modal"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const handleLogout = () => {
    // Handle logout logic here
    setLogoutModalOpen(false)
    // For now, just close the modal
    console.log("Logging out...")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />
      <Header onLogoutClick={() => setLogoutModalOpen(true)} />
      <main className="ml-[200px] pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
      <LogoutModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </div>
  )
}
