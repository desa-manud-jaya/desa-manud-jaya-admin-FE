"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { PartnerDashboard } from "@/components/partner/partner-dashboard";
import { ActivatedPartnerDashboard } from "@/components/partner/activated-partner-dashboard";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPendingVendorApprovals } from "@/store/slices/admin-approval-slice";
import { adminDashboardMockMetrics } from "@/lib/admin-dashboard-mock";
import {
  Users,
  Package,
  FileText,
  AlertTriangle,
  Wallet,
  CalendarDays,
  RefreshCw,
  Clock3,
  MapPin,
  TicketCheck,
  UserRound,
} from "lucide-react";

type DeletionRequestsApiResponse = {
  items: unknown[];
  page: number;
  size: number;
  total: number;
};

type DashboardTrend = {
  value: number;
  isUp: boolean;
  label: string;
};

type DashboardAction = {
  label: string;
};

type DashboardStatItem = {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBgColor: string;
  trend?: DashboardTrend;
  action?: DashboardAction;
};

type GuideBookingCard = {
  id: string;
  bookingCode: string;
  customerName: string;
  destination: string;
  date: string;
  time: string;
  pax: number;
  meetingPoint: string;
  status: string;
};

type GuideBookingApiItem = {
  id: string;
  userId: string;
  businessId: string;
  packageId: string;
  guideId: string | null;
  tripDate: string | null;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username?: string | null;
    email?: string | null;
  } | null;
  business?: {
    name?: string | null;
    address?: string | null;
  } | null;
};

type GuideBookingsResponse = {
  items: GuideBookingApiItem[];
  page: number;
  size: number;
  total: number;
};

type GuideProfileData = {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  cvDocumentUrl: string;
  approvalStatus: string;
  approvedAt: string | null;
  rejectionReason: string | null;
};

function maskToken(token?: string | null) {
  if (!token) return null;

  if (token.length <= 16) {
    return `${token.slice(0, 4)}...`;
  }

  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

function formatBookingCode(id: string) {
  if (!id) return "-";
  return `BK-${id.slice(-8).toUpperCase()}`;
}

function formatGuideBookingDate(value: string | null) {
  if (!value) return "-";

  return new Date(`${value.split("T")[0]}T00:00:00`).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function formatGuideBookingStatus(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "approved") return "Terkonfirmasi";
  if (normalized === "pending") return "Menunggu Verifikasi";
  if (normalized === "rejected") return "Ditolak";
  if (normalized === "completed") return "Selesai";

  return value || "-";
}

function mapGuideBooking(item: GuideBookingApiItem): GuideBookingCard {
  return {
    id: item.id,
    bookingCode: formatBookingCode(item.id),
    customerName: item.user?.username ?? item.user?.email ?? item.userId,
    destination: item.business?.name ?? `Paket ${item.packageId.slice(-6)}`,
    date: formatGuideBookingDate(item.tripDate),
    time: "-",
    pax: item.quantity,
    meetingPoint: item.business?.address ?? "-",
    status: formatGuideBookingStatus(item.status),
  };
}

async function fetchGuideProfile(token: string): Promise<GuideProfileData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/guide/profile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  const rawText = await response.text();
  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error("Response /guide/profile tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil profile guide",
          )
        : "Gagal mengambil profile guide";

    throw new Error(message);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Format data profile guide tidak sesuai");
  }

  return data as GuideProfileData;
}

async function fetchGuideBookings(token: string): Promise<GuideBookingCard[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/guide/bookings`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  const rawText = await response.text();
  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : { items: [], page: 0, size: 10, total: 0 };
  } catch {
    throw new Error("Response /guide/bookings tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil booking guide",
          )
        : "Gagal mengambil booking guide";

    throw new Error(message);
  }

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as GuideBookingsResponse).items)
  ) {
    throw new Error("Format data booking guide tidak sesuai");
  }

  return (data as GuideBookingsResponse).items.map(mapGuideBooking);
}

function formatCurrencyRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatFilterDateLabel(value: string) {
  if (!value) return "-";

  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseNumberLike(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function extractTotalRevenue(data: unknown): number {
  if (typeof data === "number") {
    return parseNumberLike(data);
  }

  if (!data || typeof data !== "object") {
    return 0;
  }

  const record = data as Record<string, unknown>;
  const candidateKeys = [
    "totalRevenue",
    "total",
    "revenue",
    "amount",
    "grandTotal",
  ];

  for (const key of candidateKeys) {
    if (key in record) {
      const value = parseNumberLike(record[key]);

      if (value !== 0 || record[key] === 0 || record[key] === "0") {
        return value;
      }
    }
  }

  if ("data" in record) {
    return extractTotalRevenue(record.data);
  }

  if ("summary" in record) {
    return extractTotalRevenue(record.summary);
  }

  return 0;
}

function buildChartPoints(values: number[]) {
  const width = 720;
  const height = 220;
  const paddingX = 24;
  const paddingY = 24;

  if (values.length === 0) return "";

  const maxValue = Math.max(...values, 1);
  const stepX =
    values.length === 1
      ? width - paddingX * 2
      : (width - paddingX * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = paddingX + index * stepX;
      const y =
        height - paddingY - (value / maxValue) * (height - paddingY * 2);

      return `${x},${y}`;
    })
    .join(" ");
}

function buildChartArea(points: string) {
  if (!points) return "";
  const firstPoint = points.split(" ")[0];
  const lastPoint = points.split(" ").at(-1);

  if (!firstPoint || !lastPoint) return "";

  const [firstX] = firstPoint.split(",");
  const [lastX] = lastPoint.split(",");

  return `${firstX},196 ${points} ${lastX},196`;
}

async function fetchPendingTourPackagesCount(token: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/pending`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
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
              "Gagal mengambil data pending package",
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
    },
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
              "Gagal mengambil deletion requests",
          )
        : "Gagal mengambil deletion requests";

    throw new Error(message);
  }

  return (data as DeletionRequestsApiResponse).total ?? 0;
}

async function fetchRevenueSummary(
  token: string,
  startDate?: string,
  endDate?: string,
): Promise<number> {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  const queryString = params.toString();
  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/revenue/summary${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const rawText = await response.text();

  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  console.log("GET /admin/revenue/summary RESPONSE:", data);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil revenue summary",
          )
        : typeof data === "string" && data.trim() !== ""
          ? data
          : "Gagal mengambil revenue summary";

    throw new Error(message);
  }

  if (!rawText) {
    return 0;
  }

  return extractTotalRevenue(data);
}

function AdminDashboardContent() {
  const dispatch = useAppDispatch();
  const { token, loginUser } = useAppSelector((state) => state.auth);
  const { pendingVendors } = useAppSelector((state) => state.adminApproval);

  const [pendingTourPackagesCount, setPendingTourPackagesCount] = useState(0);
  const [pendingDeletionRequestsCount, setPendingDeletionRequestsCount] =
    useState(0);

  const [revenueStartDate, setRevenueStartDate] = useState("");
  const [revenueEndDate, setRevenueEndDate] = useState("");
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [loadingRevenueSummary, setLoadingRevenueSummary] = useState(false);
  const [revenueSummaryMessage, setRevenueSummaryMessage] = useState<
    string | null
  >("Belum ada data revenue. Menampilkan 0 sementara.");

  useEffect(() => {
    if (
      revenueStartDate &&
      revenueEndDate &&
      revenueEndDate < revenueStartDate
    ) {
      setRevenueEndDate("");
    }
  }, [revenueStartDate, revenueEndDate]);

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

  const loadRevenueSummary = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (loginUser?.role !== "ADMIN" || !token) {
        setRevenueTotal(0);
        setRevenueSummaryMessage(
          "Belum ada data revenue. Menampilkan 0 sementara.",
        );
        return;
      }

      try {
        setLoadingRevenueSummary(true);
        setRevenueSummaryMessage(null);

        const total = await fetchRevenueSummary(token, startDate, endDate);

        setRevenueTotal(total);
        setRevenueSummaryMessage(
          total === 0
            ? "Belum ada data revenue. Menampilkan 0 sementara."
            : null,
        );
      } catch (error) {
        console.error("LOAD REVENUE SUMMARY ERROR:", error);
        setRevenueTotal(0);
        setRevenueSummaryMessage(
          "Revenue summary belum tersedia. Menampilkan 0 sementara.",
        );
      } finally {
        setLoadingRevenueSummary(false);
      }
    },
    [loginUser, token],
  );

  useEffect(() => {
    loadRevenueSummary();
  }, [loadRevenueSummary]);

  const handleGenerateRevenueSummary = async () => {
    if (
      revenueStartDate &&
      revenueEndDate &&
      revenueStartDate > revenueEndDate
    ) {
      setRevenueTotal(0);
      setRevenueSummaryMessage(
        "Start date tidak boleh lebih besar dari end date.",
      );
      return;
    }

    await loadRevenueSummary(revenueStartDate, revenueEndDate);
  };

  const handleResetRevenueFilter = async () => {
    setRevenueStartDate("");
    setRevenueEndDate("");
    await loadRevenueSummary();
  };

  const selectedRangeLabel =
    revenueStartDate || revenueEndDate
      ? `${formatFilterDateLabel(revenueStartDate)} - ${formatFilterDateLabel(
          revenueEndDate,
        )}`
      : "Semua Periode";

  const statsRow1 = useMemo<DashboardStatItem[]>(
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
    [
      pendingDeletionRequestsCount,
      pendingTourPackagesCount,
      pendingVendors.length,
    ],
  );

  const statsRow2 = useMemo<DashboardStatItem[]>(
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
        title: "Verifikasi Pembayaran Menunggu",
        value: "-",
        action: { label: "Tinjau pembayaran" },
        icon: <FileText className="h-6 w-6 text-blue-600" />,
        iconBgColor: "bg-blue-100",
      },
    ],
    [],
  );

  const revenueChartValues = useMemo(() => {
    return [
      revenueTotal,
      revenueTotal,
      revenueTotal,
      revenueTotal,
      revenueTotal,
      revenueTotal,
      revenueTotal,
    ];
  }, [revenueTotal]);

  const chartPoints = useMemo(
    () => buildChartPoints(revenueChartValues),
    [revenueChartValues],
  );

  const chartArea = useMemo(() => buildChartArea(chartPoints), [chartPoints]);

  const pointCoordinates = useMemo(() => {
    return chartPoints
      .split(" ")
      .filter(Boolean)
      .map((point) => {
        const [x, y] = point.split(",");
        return {
          x: Number(x),
          y: Number(y),
        };
      });
  }, [chartPoints]);

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
            action={stat.action}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Revenue Summary
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Grafik ringkasan revenue admin berdasarkan filter tanggal
              opsional.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleResetRevenueFilter}
            disabled={loadingRevenueSummary}
          >
            Reset Filter
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Start Date
            </label>
            <input
              type="date"
              value={revenueStartDate}
              onChange={(e) => setRevenueStartDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              End Date
            </label>
            <input
              type="date"
              value={revenueEndDate}
              min={revenueStartDate || undefined}
              disabled={!revenueStartDate}
              onChange={(e) => setRevenueEndDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              className="h-12 w-full bg-sky-600 hover:bg-sky-700 lg:w-auto"
              onClick={handleGenerateRevenueSummary}
              disabled={
                loadingRevenueSummary ||
                (Boolean(revenueEndDate) && !revenueStartDate)
              }
            >
              {loadingRevenueSummary ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Trend</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {loadingRevenueSummary
                    ? "Memuat..."
                    : formatCurrencyRupiah(revenueTotal)}
                </p>
              </div>

              <div className="rounded-full bg-emerald-100 p-3">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-background p-4">
              <svg viewBox="0 0 720 220" className="h-[240px] w-full">
                <line
                  x1="24"
                  y1="196"
                  x2="696"
                  y2="196"
                  className="stroke-border"
                />
                <line
                  x1="24"
                  y1="138"
                  x2="696"
                  y2="138"
                  className="stroke-border"
                />
                <line
                  x1="24"
                  y1="80"
                  x2="696"
                  y2="80"
                  className="stroke-border"
                />
                <line
                  x1="24"
                  y1="24"
                  x2="696"
                  y2="24"
                  className="stroke-border"
                />

                {chartArea && (
                  <polyline
                    fill="rgba(16,185,129,0.12)"
                    stroke="none"
                    points={chartArea}
                  />
                )}

                {chartPoints && (
                  <polyline
                    fill="none"
                    stroke="rgb(16 185 129)"
                    strokeWidth="4"
                    points={chartPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {pointCoordinates.map((point, index) => (
                  <circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="rgb(16 185 129)"
                  />
                ))}
              </svg>
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Chart sementara memakai summary total karena endpoint saat ini
              baru menyediakan total revenue summary.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Periode</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {selectedRangeLabel}
                  </p>
                </div>

                <div className="rounded-full bg-blue-100 p-3">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">Status Data</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {revenueTotal > 0 ? "Data tersedia" : "Belum ada data"}
              </p>

              {revenueSummaryMessage && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {revenueSummaryMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRecordValue(source: unknown, key: string): unknown {
  if (!source || typeof source !== "object") {
    return null;
  }

  return (source as Record<string, unknown>)[key];
}

function extractGuideStatus(loginUser: unknown, vendorData: unknown) {
  const guideProfile = getRecordValue(loginUser, "guideProfile");
  const nestedGuideStatus =
    getRecordValue(guideProfile, "approvalStatus") ??
    getRecordValue(guideProfile, "status");

  const status =
    getRecordValue(loginUser, "approvalStatus") ??
    getRecordValue(loginUser, "guideStatus") ??
    getRecordValue(loginUser, "status") ??
    nestedGuideStatus ??
    getRecordValue(vendorData, "status");

  return typeof status === "string" ? status.toUpperCase() : "";
}

function isApprovedStatus(status: string | null | undefined) {
  return (
    status === "APPROVED" ||
    status === "ACTIVATED" ||
    status === "ACTIVE" ||
    status === "VERIFIED" ||
    status === "ACCEPTED"
  );
}

function PendingGuideDashboardContent({
  guideProfile,
  errorMessage,
}: {
  guideProfile: GuideProfileData | null;
  errorMessage?: string | null;
}) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
          <Clock3 className="h-7 w-7 text-sky-600" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-sky-700">
          Guide Lokal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Tunggu persetujuan dari admin
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {guideProfile?.fullName
            ? `${guideProfile.fullName}, akun guide lokal kamu sedang ditinjau.`
            : "Akun guide lokal kamu sedang ditinjau."}{" "}
          Setelah disetujui, dashboard akan menampilkan booking wisata yang
          sudah ditugaskan.
        </p>
        {guideProfile?.rejectionReason && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {guideProfile.rejectionReason}
          </div>
        )}
        {errorMessage && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

function VerifiedGuideDashboardContent({
  guideProfile,
  bookings,
  loading,
  errorMessage,
}: {
  guideProfile: GuideProfileData | null;
  bookings: GuideBookingCard[];
  loading: boolean;
  errorMessage: string | null;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-sky-600">Dashboard Guide</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {guideProfile?.fullName
            ? `Jadwal Booking ${guideProfile.fullName}`
            : "Jadwal Booking Wisata"}
        </h1>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-lg border border-border bg-background p-5 text-sm text-muted-foreground shadow-sm">
            Memuat booking guide...
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            {errorMessage}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-5 text-sm text-muted-foreground shadow-sm">
            Belum ada booking yang ditugaskan.
          </div>
        ) : (
          bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex min-h-[25vh] flex-col justify-between rounded-lg border border-sky-100 bg-background p-5 shadow-sm md:flex-row md:items-stretch md:gap-6"
            >
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {booking.bookingCode}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-foreground">
                    {booking.destination}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Titik kumpul: {booking.meetingPoint}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                      <Clock3 className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Waktu</p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.date}, {booking.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <UserRound className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Nama Pemesan
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                      <TicketCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Kode Booking
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.bookingCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Peserta</p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.pax} orang
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function RolePreviewDashboardContent() {
  const { loginUser, token } = useAppSelector((state) => state.auth);
  const isGuide = loginUser?.role === "GUIDE";

  const authLoginResponse = {
    id: loginUser?.id ?? null,
    username: loginUser?.username ?? null,
    role: loginUser?.role ?? null,
    token: maskToken(token),
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-sky-600">
          Dashboard {isGuide ? "Guide" : "Role Baru"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          {isGuide
            ? "Berhasil login sebagai guide"
            : `Berhasil login sebagai ${loginUser?.role ?? "pengguna"}`}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Response dari endpoint auth/login berhasil diterima. Role yang didapat
          adalah{" "}
          <span className="font-semibold text-foreground">
            {loginUser?.role ?? "-"}
          </span>
          .
        </p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground">
            Skema response auth/login
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed text-foreground">
            {JSON.stringify(authLoginResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { hydrated, isAuthenticated, loginUser, vendorData, token } =
    useAppSelector((state) => state.auth);
  const [guideProfile, setGuideProfile] = useState<GuideProfileData | null>(
    null,
  );
  const [loadingGuideProfile, setLoadingGuideProfile] = useState(false);
  const [guideProfileError, setGuideProfileError] = useState<string | null>(
    null,
  );
  const [guideBookings, setGuideBookings] = useState<GuideBookingCard[]>([]);
  const [loadingGuideBookings, setLoadingGuideBookings] = useState(false);
  const [guideBookingsError, setGuideBookingsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || loginUser?.role !== "GUIDE" || !token) {
      setGuideProfile(null);
      setGuideProfileError(null);
      setGuideBookings([]);
      setGuideBookingsError(null);
      return;
    }

    let isMounted = true;

    const loadGuideProfile = async () => {
      try {
        setLoadingGuideProfile(true);
        setGuideProfileError(null);

        const profile = await fetchGuideProfile(token);

        if (!isMounted) return;
        setGuideProfile(profile);
      } catch (error) {
        if (!isMounted) return;

        setGuideProfile(null);
        setGuideProfileError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil profile guide",
        );
      } finally {
        if (!isMounted) return;
        setLoadingGuideProfile(false);
      }
    };

    loadGuideProfile();

    return () => {
      isMounted = false;
    };
  }, [hydrated, isAuthenticated, loginUser, token]);

  const isVendor = loginUser?.role === "VENDOR";
  const isAdmin = loginUser?.role === "ADMIN";
  const isGuide = loginUser?.role === "GUIDE";
  const shouldShowRolePreview = !isAdmin && !isVendor && !isGuide;

  const vendorStatus =
    vendorData?.status ?? vendorData?.vendorProfile?.approvalStatus ?? null;

  const isVendorActivated = isApprovedStatus(vendorStatus);
  const guideStatus =
    guideProfile?.approvalStatus?.toUpperCase() ||
    extractGuideStatus(loginUser, vendorData);
  const isGuideActivated = isApprovedStatus(guideStatus);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !isGuide || !token || !isGuideActivated) {
      setGuideBookings([]);
      setGuideBookingsError(null);
      return;
    }

    let isMounted = true;

    const loadGuideBookings = async () => {
      try {
        setLoadingGuideBookings(true);
        setGuideBookingsError(null);

        const bookings = await fetchGuideBookings(token);

        if (!isMounted) return;
        setGuideBookings(bookings);
      } catch (error) {
        if (!isMounted) return;

        setGuideBookings([]);
        setGuideBookingsError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil booking guide",
        );
      } finally {
        if (!isMounted) return;
        setLoadingGuideBookings(false);
      }
    };

    loadGuideBookings();

    return () => {
      isMounted = false;
    };
  }, [hydrated, isAuthenticated, isGuide, isGuideActivated, token]);

  if (!hydrated || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px]" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {shouldShowRolePreview ? (
        <RolePreviewDashboardContent />
      ) : isGuide && loadingGuideProfile ? (
        <div className="min-h-[300px] rounded-xl border border-border bg-background p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Memuat profile guide...
          </p>
        </div>
      ) : isGuide ? (
        isGuideActivated ? (
          <VerifiedGuideDashboardContent
            guideProfile={guideProfile}
            bookings={guideBookings}
            loading={loadingGuideBookings}
            errorMessage={guideBookingsError}
          />
        ) : (
          <PendingGuideDashboardContent
            guideProfile={guideProfile}
            errorMessage={guideProfileError}
          />
        )
      ) : isVendor ? (
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
