"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TableFilter } from "@/components/dashboard/table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ApprovedVendorApiItem = {
  userId: string;
  username: string;
  email: string;
  vendorName: string;
  phone: string;
  address: string;
  ktpNumber: string;
};

type PartnerRow = {
  id: string;
  partnerName: string;
  ownerName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  ktpNumber: string;
  businessType: string;
  joinDate: string;
  status: "active" | "inactive";
};

function TableSkeletonRows({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              <Skeleton
                className={
                  columnIndex === columns - 1
                    ? "h-9 w-[90px]"
                    : "h-5 w-full max-w-[200px]"
                }
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

async function fetchApprovedVendors(
  token: string
): Promise<ApprovedVendorApiItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vendors/approved`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = [];

  try {
    data = rawText ? JSON.parse(rawText) : [];
    console.log("GET /admin/vendors/approved RESPONSE:", data);
  } catch {
    throw new Error("Response /admin/vendors/approved tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil data approved vendors"
          )
        : "Gagal mengambil data approved vendors";

    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Format data approved vendors tidak sesuai");
  }

  return data as ApprovedVendorApiItem[];
}

function mapApprovedVendorToRow(item: ApprovedVendorApiItem): PartnerRow {
  return {
    id: item.userId || "-",
    partnerName: item.vendorName || "-",
    ownerName: item.username || "-",
    username: item.username || "-",
    email: item.email || "-",
    phone: item.phone || "-",
    address: item.address || "-",
    ktpNumber: item.ktpNumber || "-",
    businessType: "-",
    joinDate: "-",
    status: "active",
  };
}

type PartnerDetailModalProps = {
  open: boolean;
  partner: PartnerRow | null;
  onClose: () => void;
};

function DetailItem({
  label,
  value,
  className = "",
  multiline = false,
}: {
  label: string;
  value: string;
  className?: string;
  multiline?: boolean;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <div
        className={`rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground ${
          multiline ? "min-h-[120px] whitespace-pre-wrap" : "min-h-[52px] flex items-center"
        }`}
      >
        <span className={label === "ID Mitra" ? "break-all" : "break-words"}>
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

function PartnerDetailModal({
  open,
  partner,
  onClose,
}: PartnerDetailModalProps) {
  if (!open || !partner) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
        <div
          className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Detail Mitra
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informasi lengkap data mitra
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Tutup modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DetailItem label="ID Mitra" value={partner.id} />
              <DetailItem label="Nama Mitra" value={partner.partnerName} />

              <DetailItem label="Nama Pemilik" value={partner.ownerName} />
              <DetailItem label="Username" value={partner.username} />

              <DetailItem label="Email" value={partner.email} />
              <DetailItem label="Nomor Telepon" value={partner.phone} />

              <DetailItem label="Nomor KTP" value={partner.ktpNumber} />
              <DetailItem label="Jenis Bisnis" value={partner.businessType} />

              <DetailItem label="Bergabung Sejak" value={partner.joinDate} />

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex min-h-[52px] items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <Badge
                    className={
                      partner.status === "active"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {partner.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>

              <DetailItem
                label="Alamat"
                value={partner.address}
                className="md:col-span-2"
                multiline
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerManagePage() {
  const router = useRouter();

  const { hydrated, isAuthenticated, loginUser, token } = useAppSelector(
    (state) => state.auth
  );

  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [errorPartners, setErrorPartners] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerRow | null>(
    null
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!detailOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [detailOpen]);

  useEffect(() => {
    if (!hydrated) return;

    if (loginUser?.role !== "ADMIN" || !token) {
      setPartners([]);
      setErrorPartners(null);
      return;
    }

    let isMounted = true;

    const loadApprovedVendors = async () => {
      try {
        setLoadingPartners(true);
        setErrorPartners(null);

        const approvedVendors = await fetchApprovedVendors(token);
        const mappedPartners = approvedVendors.map(mapApprovedVendorToRow);

        console.log("MAPPED APPROVED VENDORS:", mappedPartners);

        if (!isMounted) return;
        setPartners(mappedPartners);
      } catch (error) {
        console.error("LOAD APPROVED VENDORS ERROR:", error);

        if (!isMounted) return;
        setPartners([]);
        setErrorPartners(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data approved vendors"
        );
      } finally {
        if (!isMounted) return;
        setLoadingPartners(false);
      }
    };

    loadApprovedVendors();

    return () => {
      isMounted = false;
    };
  }, [hydrated, loginUser, token]);

  const handleOpenDetail = (partner: PartnerRow) => {
    setSelectedPartner(partner);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedPartner(null);
  };

  if (!hydrated || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px]" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Daftar Mitra</h1>

        <TableFilter
          businessTypeOptions={[
            { value: "all", label: "Semua" },
            { value: "outdoor", label: "Aktivitas Outdoor" },
            { value: "homestay", label: "Homestay" },
            { value: "cafe", label: "Kafe" },
          ]}
        />

        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Nama Mitra</TableHead>
                <TableHead className="font-semibold">Nama Pemilik</TableHead>
                <TableHead className="font-semibold">Alamat</TableHead>
                <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                <TableHead className="font-semibold">Bergabung Sejak</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Tindakan</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingPartners ? (
                <TableSkeletonRows columns={8} />
              ) : errorPartners ? (
                <TableRow>
                  <TableCell className="text-center text-red-500" colSpan={8}>
                    {errorPartners}
                  </TableCell>
                </TableRow>
              ) : partners.length > 0 ? (
                partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.id}</TableCell>
                    <TableCell>{partner.partnerName}</TableCell>
                    <TableCell>{partner.ownerName}</TableCell>
                    <TableCell>{partner.address}</TableCell>
                    <TableCell>{partner.businessType}</TableCell>
                    <TableCell>{partner.joinDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          partner.status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          partner.status === "active"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {partner.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleOpenDetail(partner)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={8}
                  >
                    Tidak ada data mitra
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PartnerDetailModal
        open={detailOpen}
        partner={selectedPartner}
        onClose={handleCloseDetail}
      />
    </DashboardLayout>
  );
}
