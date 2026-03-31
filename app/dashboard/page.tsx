"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { PartnerDashboard } from "@/components/partner/partner-dashboard";
import { ActivatedPartnerDashboard } from "@/components/partner/activated-partner-dashboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPendingVendorApprovals } from "@/store/slices/admin-approval-slice";
import { adminDashboardMockMetrics } from "@/lib/admin-dashboard-mock";
import {
  Users,
  Package,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type DeletionRequestsApiResponse = {
  items: unknown[];
  page: number;
  size: number;
  total: number;
};

async function fetchPendingTourPackagesCount(token: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/pending`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = [];

  try {
    data = rawText ? JSON.parse(rawText) : [];
  } catch {
    throw new Error("Response /admin/packages/pending tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil data pending package"
          )
        : "Gagal mengambil data pending package";

    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Format data pending package tidak sesuai");
  }

  return data.length;
}

async function fetchDeletionRequestsCount(token: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/deletion-requests?page=0&size=10`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = { items: [], total: 0 };

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Response /admin/packages/deletion-requests tidak valid");
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil deletion requests"
          )
        : "Gagal mengambil deletion requests";

    throw new Error(message);
  }

  return (data as DeletionRequestsApiResponse).total ?? 0;
}

function AdminDashboardContent() {
  const dispatch = useAppDispatch();
  const { token, loginUser } = useAppSelector((state) => state.auth);
  const { pendingVendors } = useAppSelector((state) => state.adminApproval);

  const [pendingTourPackagesCount, setPendingTourPackagesCount] = useState(0);
  const [pendingDeletionRequestsCount, setPendingDeletionRequestsCount] =
    useState(0);

  useEffect(() => {
    if (loginUser?.role === "ADMIN") {
      dispatch(getPendingVendorApprovals());
    }
  }, [dispatch, loginUser]);

  useEffect(() => {
    if (loginUser?.role !== "ADMIN" || !token) {
      setPendingTourPackagesCount(0);
      setPendingDeletionRequestsCount(0);
      return;
    }

    let isMounted = true;

    const loadAdminDashboardMetrics = async () => {
      try {
        const [tourPackagesCount, deletionRequestsCount] = await Promise.all([
          fetchPendingTourPackagesCount(token),
          fetchDeletionRequestsCount(token),
        ]);

        if (!isMounted) return;

        setPendingTourPackagesCount(tourPackagesCount);
        setPendingDeletionRequestsCount(deletionRequestsCount);
      } catch (error) {
        console.error("LOAD ADMIN DASHBOARD METRICS ERROR:", error);

        if (!isMounted) return;

        setPendingTourPackagesCount(0);
        setPendingDeletionRequestsCount(0);
      }
    };

    loadAdminDashboardMetrics();

    return () => {
      isMounted = false;
    };
  }, [loginUser, token]);

  const statsRow1 = useMemo(
    () => [
      {
        title: "Pendaftaran Mitra Menunggu",
        value: pendingVendors.length,
        icon: <Users className="h-6 w-6 text-indigo-600" />,
        iconBgColor: "bg-indigo-100",
      },
      {
        title: "Persetujuan Paket Wisata Menunggu",
        value: pendingTourPackagesCount,
        icon: <Package className="h-6 w-6 text-amber-600" />,
        iconBgColor: "bg-amber-100",
      },
      {
        title: "Permintaan Penghapusan Menunggu",
        value: pendingDeletionRequestsCount,
        icon: <FileText className="h-6 w-6 text-emerald-600" />,
        iconBgColor: "bg-emerald-100",
      },
      {
        title: "Paket Dilaporkan",
        value: 0,
        trend: { value: 1, isUp: false, label: "Turun dari bulan lalu" },
        icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
        iconBgColor: "bg-red-100",
      },
    ],
    [pendingDeletionRequestsCount, pendingTourPackagesCount, pendingVendors.length]
  );

  const statsRow2 = useMemo(
    () => [
      {
        title: "Mitra Aktif",
        value: adminDashboardMockMetrics.activePartners,
        icon: <Users className="h-6 w-6 text-indigo-600" />,
        iconBgColor: "bg-indigo-100",
      },
      {
        title: "Paket Wisata Aktif",
        value: adminDashboardMockMetrics.activeTourPackages,
        icon: <Package className="h-6 w-6 text-amber-600" />,
        iconBgColor: "bg-amber-100",
      },
      {
        title: "Verifikasi Eco Menunggu",
        value: "-",
        action: { label: "Tinjau bukti" },
        icon: <FileText className="h-6 w-6 text-emerald-600" />,
        iconBgColor: "bg-emerald-100",
      },
      {
        title: "Total Pendapatan Platform",
        value: "7000K",
        trend: { value: 1.8, isUp: true, label: "Naik dari bulan lalu" },
        icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
        iconBgColor: "bg-emerald-100",
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dasbor</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsRow1.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsRow2.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            action={stat.action}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { hydrated, isAuthenticated, loginUser, vendorData } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px]" />
      </DashboardLayout>
    );
  }

  const isVendor = loginUser?.role === "VENDOR";

  const vendorStatus =
    vendorData?.status ?? vendorData?.vendorProfile?.approvalStatus ?? null;

  const isVendorActivated =
    vendorStatus === "APPROVED" ||
    vendorStatus === "ACTIVATED" ||
    vendorStatus === "ACTIVE";

  return (
    <DashboardLayout>
      {isVendor ? (
        isVendorActivated ? (
          <ActivatedPartnerDashboard />
        ) : (
          <PartnerDashboard />
        )
      ) : (
        <AdminDashboardContent />
      )}
    </DashboardLayout>
  );
}
