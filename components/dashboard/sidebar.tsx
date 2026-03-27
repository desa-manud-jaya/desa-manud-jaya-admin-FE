"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isLogout?: boolean;
  underDevelopment?: boolean;
};

const adminMenu: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pusat Persetujuan", href: "/pusat-persetujuan", icon: CheckCircle },
  { name: "Verifikasi Eco", href: "/verifikasi-eco", icon: Leaf },
  { name: "Kelola Mitra", href: "/kelola-mitra", icon: Users },
  // { name: "Kelola Paket", href: "/kelola-paket", icon: Package },
];

const partnerDraftTopMenu: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kelola Paket", href: "/kelola-paket", icon: Package },
];

const partnerDraftBottomMenu: MenuItem[] = [
  { name: "Business Profile", href: "/profil-bisnis", icon: Building2 },
  {
    name: "Document Verification",
    href: "/verifikasi-dokumen",
    icon: FileCheck,
  },
];

const partnerActivatedTopMenu: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Tour Package", href: "/kelola-paket", icon: Package },
  {
    name: "Booking Manage",
    href: "/booking-manage",
    icon: CalendarDays,
    underDevelopment: true,
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: MessageSquare,
    underDevelopment: true,
  },
];

const partnerActivatedPagesMenu: MenuItem[] = [
  {
    name: "Impact Analytics",
    href: "/impact-analytics",
    icon: BarChart3,
    underDevelopment: true,
  },
  {
    name: "Eco Verification",
    href: "/eco-verification",
    icon: Leaf,
    underDevelopment: true,
  },
];

const partnerActivatedBottomMenu: MenuItem[] = [
  { name: "Business Profile", href: "/profil-bisnis", icon: Building2 },
  {
    name: "Document Verification",
    href: "/verifikasi-dokumen",
    icon: FileCheck,
  },
];

const commonBottomMenu: MenuItem[] = [
  { name: "Settings", href: "/pengaturan", icon: Settings },
  { name: "Logout", href: "#", icon: LogOut, isLogout: true },
];

interface SidebarProps {
  onLogoutClick?: () => void;
}

export function Sidebar({ onLogoutClick }: SidebarProps) {
  const pathname = usePathname();
  const [underDevelopmentOpen, setUnderDevelopmentOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");

  const { hydrated, loginUser, vendorData } = useAppSelector(
    (state) => state.auth
  );

  const currentRole = loginUser?.role ?? null;
  const rawStatus =
    vendorData?.status ?? vendorData?.vendorProfile?.approvalStatus ?? "";

  const isAdmin = currentRole === "ADMIN";
  const isVendor = currentRole === "VENDOR";
  const isActivatedPartner =
    isVendor &&
    (rawStatus === "APPROVED" ||
      rawStatus === "ACTIVE" ||
      rawStatus === "ACTIVATED");

  const activeClass = isAdmin
    ? "bg-emerald-500 text-white"
    : "bg-blue-500 text-white";

  const inactiveClass =
    "text-muted-foreground hover:bg-muted hover:text-foreground";

  const openUnderDevelopmentModal = (featureName: string) => {
    setSelectedFeature(featureName);
    setUnderDevelopmentOpen(true);
  };

  const renderNavItem = (item: MenuItem, fullWidth = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    if (item.isLogout) {
      return (
        <button
          key={item.name}
          type="button"
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

    if (item.underDevelopment) {
      return (
        <button
          key={item.name}
          type="button"
          onClick={() => openUnderDevelopmentModal(item.name)}
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

  if (!hydrated) {
    return (
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-border bg-background">
        <div className="flex h-16 items-center px-6">
          <span className="text-xl font-bold text-foreground">Portal</span>
        </div>
      </aside>
    );
  }

  if (isAdmin) {
    return (
      <>
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-border bg-background">
          <div className="flex h-16 items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-1">
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

        <UnderDevelopmentDialog
          open={underDevelopmentOpen}
          onOpenChange={setUnderDevelopmentOpen}
          featureName={selectedFeature}
        />
      </>
    );
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-border bg-background">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="text-xl font-bold text-blue-500">Portal</span>
            <span className="text-xl font-bold text-foreground">Partners</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col justify-between px-3 py-4">
          <div className="flex flex-col gap-1">
            {(isActivatedPartner
              ? partnerActivatedTopMenu
              : partnerDraftTopMenu
            ).map((item) => renderNavItem(item))}

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
              {(isActivatedPartner
                ? partnerActivatedBottomMenu
                : partnerDraftBottomMenu
              ).map((item) => renderNavItem(item))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {commonBottomMenu.map((item) => renderNavItem(item, true))}
          </div>
        </nav>
      </aside>

      <UnderDevelopmentDialog
        open={underDevelopmentOpen}
        onOpenChange={setUnderDevelopmentOpen}
        featureName={selectedFeature}
      />
    </>
  );
}

type UnderDevelopmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
};

function UnderDevelopmentDialog({
  open,
  onOpenChange,
  featureName,
}: UnderDevelopmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] rounded-[24px] p-6">
        <DialogTitle className="text-lg font-semibold text-foreground">
          Under Development
        </DialogTitle>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Fitur{" "}
          <span className="font-medium text-foreground">{featureName}</span>{" "}
          masih dalam tahap pengembangan dan belum tersedia saat ini.
        </p>

        <div className="mt-5">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Oke
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}