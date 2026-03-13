"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PartnerAccountStatus, UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckCircle,
  Leaf,
  Users,
  Package,
  Settings,
  LogOut,
  Building2,
  FileCheck,
  CalendarDays,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const adminMenu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pusat Persetujuan", href: "/pusat-persetujuan", icon: CheckCircle },
  { name: "Verifikasi Eco", href: "/verifikasi-eco", icon: Leaf },
  { name: "Kelola Mitra", href: "/kelola-mitra", icon: Users },
  { name: "Kelola Paket", href: "/kelola-paket", icon: Package },
];

const partnerDraftTopMenu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
];

const partnerDraftBottomMenu = [
  { name: "Business Profile", href: "/profil-bisnis", icon: Building2 },
  { name: "Document Verification", href: "/verifikasi-dokumen", icon: FileCheck },
];

const partnerActivatedTopMenu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Tour Package", href: "/kelola-paket", icon: Package },
  { name: "Booking Manage", href: "/booking-manage", icon: CalendarDays },
  { name: "Reviews", href: "/reviews", icon: MessageSquare },
];

const partnerActivatedPagesMenu = [
  { name: "Impact Analytics", href: "/impact-analytics", icon: BarChart3 },
  { name: "Eco Verification", href: "/eco-verification", icon: Leaf },
];

const partnerActivatedBottomMenu = [
  { name: "Business Profile", href: "/profil-bisnis", icon: Building2 },
  { name: "Document Verification", href: "/verifikasi-dokumen", icon: FileCheck },
];

const commonBottomMenu = [
  { name: "Settings", href: "/pengaturan", icon: Settings },
  { name: "Logout", href: "#", icon: LogOut, isLogout: true },
];

interface SidebarProps {
  role?: UserRole;
  accountStatus?: PartnerAccountStatus;
  onLogoutClick?: () => void;
}

export function Sidebar({
  role = "admin",
  accountStatus,
  onLogoutClick,
}: SidebarProps) {
  const pathname = usePathname();

  const isPartner = role === "partner";
  const isActivatedPartner = isPartner && accountStatus === "Activated";

  const activeClass = isPartner
    ? "bg-blue-500 text-white"
    : "bg-emerald-500 text-white";

  const inactiveClass =
    "text-muted-foreground hover:bg-muted hover:text-foreground";

  const renderNavItem = (
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      isLogout?: boolean;
    },
    fullWidth = false
  ) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    if (item.isLogout) {
      return (
        <button
          key={item.name}
          onClick={onLogoutClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            fullWidth && "w-full",
            inactiveClass
          )}
        >
          <Icon className="h-5 w-5" />
          {item.name}
        </button>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive ? activeClass : inactiveClass
        )}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  if (role === "admin") {
    return (
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-border bg-background">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-emerald-500">Portal</span>
            <span className="text-xl font-bold text-foreground">Admin</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col justify-between px-3 py-4">
          <div className="flex flex-col gap-1">
            {adminMenu.map((item) => renderNavItem(item))}
          </div>

          <div className="border-t border-border pt-4">
            {commonBottomMenu.map((item) => renderNavItem(item, true))}
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-blue-500">Portal</span>
          <span className="text-xl font-bold text-foreground">Partners</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col justify-between px-3 py-4">
        <div className="flex flex-col gap-1">
          {(isActivatedPartner ? partnerActivatedTopMenu : partnerDraftTopMenu).map((item) =>
            renderNavItem(item)
          )}

          {isActivatedPartner && (
            <>
              <div className="mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pages
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {partnerActivatedPagesMenu.map((item) => renderNavItem(item))}
              </div>
            </>
          )}

          <div className="mt-5 border-t border-border pt-4">
            {(isActivatedPartner ? partnerActivatedBottomMenu : partnerDraftBottomMenu).map(
              (item) => renderNavItem(item)
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {commonBottomMenu.map((item) => renderNavItem(item, true))}
        </div>
      </nav>
    </aside>
  );
}