"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckCircle,
  Leaf,
  Users,
  Package,
  Settings,
  LogOut,
} from "lucide-react"

const menuItems = [
  { name: "Dasbor", href: "/", icon: LayoutDashboard },
  { name: "Pusat Persetujuan", href: "/pusat-persetujuan", icon: CheckCircle },
  { name: "Verifikasi Eco", href: "/verifikasi-eco", icon: Leaf },
  { name: "Kelola Mitra", href: "/kelola-mitra", icon: Users },
  { name: "Kelola Paket", href: "/kelola-paket", icon: Package },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  { name: "Keluar", href: "#", icon: LogOut, isLogout: true },
]

interface SidebarProps {
  onLogoutClick?: () => void
}

export function Sidebar({ onLogoutClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[200px] border-r border-border bg-background">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-emerald-500">Portal</span>
          <span className="text-xl font-bold text-foreground">Admin</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isLogout) {
            return (
              <button
                key={item.name}
                onClick={onLogoutClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
