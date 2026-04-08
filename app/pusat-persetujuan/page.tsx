"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ApprovalModal } from "@/components/dashboard/approval-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getPendingVendorApprovals,
  approvePendingVendor,
  rejectPendingVendor,
} from "@/store/slices/admin-approval-slice";

type ApprovalStatus = "pending" | "approved" | "rejected";
type ApprovalAction = "approve" | "reject";
type ApprovalSection = "partner" | "tour" | "deletion";

type PartnerApprovalItem = {
  id: string;
  businessName: string;
  businessType: string;
  requestor: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  ktpNumber: string;
  submissionDate: string;
  documentStatus: string;
  status: ApprovalStatus;
};

type TourPackageApprovalItem = {
  id: string;
  packageName: string;
  partnerName: string;
  requestor: string;
  category: string;
  price: string;
  duration: number;
  availability: number;
  itinerary: string[];
  included: string[];
  termsAndConditions: string;
  pricingPolicy: string;
  cancellationPolicy: string;
  requirementDocumentUrl: string | null;
  photoUrl: string | null;
  moderationNote: string | null;
  submissionDate: string;
  status: ApprovalStatus;
};

type DeletionRequestItem = {
  id: string;
  packageName: string;
  businessName: string;
  requestor: string;
  submissionDate: string;
  changeType: string;
  category: string;
  price: string;
  duration: number;
  availability: number;
  itinerary: string[];
  included: string[];
  termsAndConditions: string;
  pricingPolicy: string;
  cancellationPolicy: string;
  deletionRequestReason: string;
  deletionReviewNote: string;
  moderationNote: string;
  status: ApprovalStatus;
};

type DeletionRequestApiItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  availability: number;
  itinerary: string[];
  included: string[];
  termsAndConditions: string;
  pricingPolicy: string;
  cancellationPolicy: string;
  requirementDocumentUrl: string | null;
  photoUrl: string | null;
  approvalStatus: string;
  vendorId: string;
  businessId: string;
  rejectionReason: string | null;
  moderationNote: string | null;
  deletionRequestStatus: string;
  deletionRequestReason: string | null;
  deletionReviewNote: string | null;
  deletionReviewerId: string | null;
  deletionRequestedAt: string | null;
  deletionReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DeletionRequestsApiResponse = {
  items: DeletionRequestApiItem[];
  page: number;
  size: number;
  total: number;
};

type PendingTourPackageApiItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  availability: number;
  itinerary: string[];
  included: string[];
  termsAndConditions: string;
  pricingPolicy: string;
  cancellationPolicy: string;
  requirementDocumentUrl: string | null;
  photoUrl: string | null;
  approvalStatus: string;
  vendorId: string;
  businessId: string;
  rejectionReason: string | null;
  moderationNote: string | null;
  deletionRequestStatus: string;
  deletionRequestReason: string | null;
  deletionReviewNote: string | null;
  deletionReviewerId: string | null;
  deletionRequestedAt: string | null;
  deletionReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatSubmissionDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCategoryLabel(value: string) {
  if (!value) return "-";

  return value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function mapApprovalStatus(value: string): ApprovalStatus {
  if (value === "APPROVED") return "approved";
  if (value === "REJECTED") return "rejected";
  return "pending";
}

async function fetchPendingTourPackages(
  token: string,
): Promise<PendingTourPackageApiItem[]> {
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

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : [];
    console.log("GET /admin/packages/pending RESPONSE:", data);
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

  return data as PendingTourPackageApiItem[];
}

interface ApprovalTableProps {
  title: string;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

function ApprovalTable({
  title,
  children,
  searchValue,
  onSearchChange,
}: ApprovalTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari"
            className="w-[180px] pl-10"
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Disetujui
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Ditolak
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
      Menunggu
    </Badge>
  );
}

function formatDeletionDate(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mapDeletionStatus(value: string): ApprovalStatus {
  if (value === "APPROVED") return "approved";
  if (value === "REJECTED") return "rejected";
  return "pending";
}

async function parseApiResponse(response: Response) {
  const rawText = await response.text();

  console.log("RAW API RESPONSE TEXT:", rawText);

  if (!rawText) {
    return null;
  }

  try {
    const jsonData = JSON.parse(rawText);
    console.log("PARSED API RESPONSE JSON:", jsonData);
    return jsonData;
  } catch {
    return rawText;
  }
}

function getApiErrorMessage(data: unknown, fallbackMessage: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    return String((data as { message?: string }).message || fallbackMessage);
  }

  if (typeof data === "string" && data.trim() !== "") {
    return data;
  }

  return fallbackMessage;
}

function formatListValue(items: string[]) {
  if (!items || items.length === 0) return "-";
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

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
          multiline
            ? "min-h-[120px] whitespace-pre-wrap"
            : "flex min-h-[52px] items-center"
        }`}
      >
        <span
          className={
            label.toLowerCase().includes("id") ? "break-all" : "break-words"
          }
        >
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

type DetailModalState =
  | { section: "partner"; item: PartnerApprovalItem }
  | { section: "tour"; item: TourPackageApprovalItem }
  | { section: "deletion"; item: DeletionRequestItem }
  | null;

function ApprovalDetailModal({
  detail,
  onClose,
}: {
  detail: DetailModalState;
  onClose: () => void;
}) {
  if (!detail) return null;

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
                {detail.section === "partner"
                  ? "Detail Persetujuan Mitra"
                  : detail.section === "tour"
                    ? "Detail Persetujuan Paket Wisata"
                    : "Detail Permintaan Penghapusan"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informasi lengkap data yang dipilih
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
            {detail.section === "partner" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <DetailItem label="ID" value={detail.item.id} />
                <DetailItem
                  label="Nama Bisnis"
                  value={detail.item.businessName}
                />
                <DetailItem label="Pemohon" value={detail.item.requestor} />
                <DetailItem label="Username" value={detail.item.username} />
                <DetailItem label="Email" value={detail.item.email} />
                <DetailItem label="Nomor Telepon" value={detail.item.phone} />
                <DetailItem label="Nomor KTP" value={detail.item.ktpNumber} />
                <DetailItem
                  label="Jenis Bisnis"
                  value={detail.item.businessType}
                />
                <DetailItem
                  label="Tanggal Pengajuan"
                  value={detail.item.submissionDate}
                />
                <DetailItem
                  label="Status Dokumen"
                  value={detail.item.documentStatus}
                />
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="flex min-h-[52px] items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <StatusBadge status={detail.item.status} />
                  </div>
                </div>
                <DetailItem
                  label="Alamat"
                  value={detail.item.address}
                  className="md:col-span-2"
                  multiline
                />
              </div>
            )}

            {detail.section === "tour" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <DetailItem label="ID" value={detail.item.id} />
                <DetailItem
                  label="Nama Paket"
                  value={detail.item.packageName}
                />
                <DetailItem
                  label="Nama Mitra"
                  value={detail.item.partnerName}
                />
                <DetailItem label="Pemohon" value={detail.item.requestor} />
                <DetailItem label="Kategori" value={detail.item.category} />
                <DetailItem label="Harga" value={detail.item.price} />
                <DetailItem
                  label="Durasi"
                  value={String(detail.item.duration)}
                />
                <DetailItem
                  label="Ketersediaan"
                  value={String(detail.item.availability)}
                />
                <DetailItem
                  label="Tanggal Pengajuan"
                  value={detail.item.submissionDate}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="flex min-h-[52px] items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <StatusBadge status={detail.item.status} />
                  </div>
                </div>

                <DetailItem
                  label="Itinerary"
                  value={formatListValue(detail.item.itinerary)}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Included"
                  value={formatListValue(detail.item.included)}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Terms and Conditions"
                  value={detail.item.termsAndConditions}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Pricing Policy"
                  value={detail.item.pricingPolicy}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Cancellation Policy"
                  value={detail.item.cancellationPolicy}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Requirement Document URL"
                  value={detail.item.requirementDocumentUrl ?? "-"}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Photo URL"
                  value={detail.item.photoUrl ?? "-"}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Moderation Note"
                  value={detail.item.moderationNote ?? "-"}
                  className="md:col-span-2"
                  multiline
                />
              </div>
            )}

            {detail.section === "deletion" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <DetailItem label="ID" value={detail.item.id} />
                <DetailItem
                  label="Nama Paket"
                  value={detail.item.packageName}
                />
                <DetailItem
                  label="Nama Bisnis"
                  value={detail.item.businessName}
                />
                <DetailItem label="Pemohon" value={detail.item.requestor} />
                <DetailItem label="Kategori" value={detail.item.category} />
                <DetailItem label="Harga" value={detail.item.price} />
                <DetailItem
                  label="Durasi"
                  value={String(detail.item.duration)}
                />
                <DetailItem
                  label="Ketersediaan"
                  value={String(detail.item.availability)}
                />
                <DetailItem
                  label="Tanggal Pengajuan"
                  value={detail.item.submissionDate}
                />
                <DetailItem
                  label="Jenis Perubahan"
                  value={detail.item.changeType}
                />

                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="flex min-h-[52px] items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <StatusBadge status={detail.item.status} />
                  </div>
                </div>

                <DetailItem
                  label="Alasan Penghapusan"
                  value={detail.item.deletionRequestReason}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Catatan Review"
                  value={detail.item.deletionReviewNote}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Moderation Note"
                  value={detail.item.moderationNote}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Itinerary"
                  value={formatListValue(detail.item.itinerary)}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Included"
                  value={formatListValue(detail.item.included)}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Terms and Conditions"
                  value={detail.item.termsAndConditions}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Pricing Policy"
                  value={detail.item.pricingPolicy}
                  className="md:col-span-2"
                  multiline
                />
                <DetailItem
                  label="Cancellation Policy"
                  value={detail.item.cancellationPolicy}
                  className="md:col-span-2"
                  multiline
                />
              </div>
            )}
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

async function approvePendingTourPackage(
  token: string,
  id: string,
  reason: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/${id}/approve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );
  const data = await parseApiResponse(response);

  console.log("APPROVE TOUR PACKAGE RESPONSE:", data);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal approve package"));
  }

  return data;
}

async function rejectPendingTourPackage(
  token: string,
  id: string,
  reason: string,
) {
  const encodedReason = encodeURIComponent(reason.trim());

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/${id}/reject?reason=${encodedReason}`;

  console.log("REJECT TOUR PACKAGE REQUEST:", {
    url,
    id,
    reason,
  });

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await parseApiResponse(response);

  console.log("REJECT TOUR PACKAGE RESPONSE:", data);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal reject package"));
  }

  return data;
}

async function fetchDeletionRequests(
  token: string,
  page = 0,
  size = 10,
): Promise<DeletionRequestsApiResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/deletion-requests?page=${page}&size=${size}`,
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

  if (rawText) {
    try {
      data = JSON.parse(rawText);
      console.log("GET /admin/packages/deletion-requests RESPONSE:", data);
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

  return data as DeletionRequestsApiResponse;
}
async function approveDeletionRequest(
  token: string,
  id: string,
  note?: string,
) {
  const query = note?.trim() ? `?note=${encodeURIComponent(note.trim())}` : "";

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/${id}/deletion-approve${query}`;

  console.log("APPROVE DELETION REQUEST:", {
    url,
    id,
    note: note?.trim() ?? "",
  });

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await parseApiResponse(response);

  console.log("APPROVE DELETION RESPONSE:", data);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal approve deletion request"));
  }

  return data;
}

async function rejectDeletionRequest(
  token: string,
  id: string,
  reason: string,
) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/packages/${id}/deletion-reject?reason=${encodeURIComponent(
    reason.trim(),
  )}`;

  console.log("REJECT DELETION REQUEST:", {
    url,
    id,
    reason: reason.trim(),
  });

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await parseApiResponse(response);

  console.log("REJECT DELETION RESPONSE:", data);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal reject deletion request"));
  }

  return data;
}

function formatShortId(value: string) {
  if (!value) return "-";
  return value.slice(0, 6);
}

export default function ApprovalCenterPage() {
  const dispatch = useAppDispatch();
  const [detailItem, setDetailItem] = useState<DetailModalState>(null);

  const { loginUser, sessionPassword, token } = useAppSelector(
    (state) => state.auth,
  );
  const {
    pendingVendors,
    loadingPendingVendors,
    errorPendingVendors,
    approvingVendor,
    rejectingVendor,
  } = useAppSelector((state) => state.adminApproval);

  const [tourPackageApprovals, setTourPackageApprovals] = useState<
    TourPackageApprovalItem[]
  >([]);
  const [loadingPendingTourPackages, setLoadingPendingTourPackages] =
    useState(false);
  const [errorPendingTourPackages, setErrorPendingTourPackages] = useState<
    string | null
  >(null);
  const [deletionRequests, setDeletionRequests] = useState<
    DeletionRequestItem[]
  >([]);
  const [loadingDeletionRequests, setLoadingDeletionRequests] = useState(false);
  const [errorDeletionRequests, setErrorDeletionRequests] = useState<
    string | null
  >(null);
  const [approvingTourPackage, setApprovingTourPackage] = useState(false);
  const [rejectingTourPackage, setRejectingTourPackage] = useState(false);

  const [approvingDeletionRequest, setApprovingDeletionRequest] =
    useState(false);
  const [rejectingDeletionRequest, setRejectingDeletionRequest] =
    useState(false);

  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerStatusMap, setPartnerStatusMap] = useState<
    Record<string, ApprovalStatus>
  >({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalType, setModalType] = useState<ApprovalAction>("approve");
  const [selectedItem, setSelectedItem] = useState<{
    section: ApprovalSection;
    id: string;
  } | null>(null);
  const openDetailModal = (detail: Exclude<DetailModalState, null>) => {
    setDetailItem(detail);
  };

  const closeDetailModal = () => {
    setDetailItem(null);
  };

  useEffect(() => {
    if (loginUser?.role === "ADMIN") {
      dispatch(getPendingVendorApprovals());
    }
  }, [dispatch, loginUser]);

  useEffect(() => {
    console.log("APPROVAL CENTER - PENDING VENDORS:", pendingVendors);
  }, [pendingVendors]);

  useEffect(() => {
    if (loginUser?.role !== "ADMIN" || !token) {
      setTourPackageApprovals([]);
      setErrorPendingTourPackages(null);
      return;
    }
    let isMounted = true;

    const loadPendingTourPackages = async () => {
      try {
        setLoadingPendingTourPackages(true);
        setErrorPendingTourPackages(null);

        const packages = await fetchPendingTourPackages(token);

        const mappedPackages: TourPackageApprovalItem[] = packages.map(
          (item) => ({
            id: item.id,
            packageName: item.name || "-",
            partnerName: "-",
            requestor: "-",
            category: formatCategoryLabel(item.category),
            price: formatCurrency(item.price),
            duration: item.duration,
            availability: item.availability,
            itinerary: item.itinerary ?? [],
            included: item.included ?? [],
            termsAndConditions: item.termsAndConditions || "-",
            pricingPolicy: item.pricingPolicy || "-",
            cancellationPolicy: item.cancellationPolicy || "-",
            requirementDocumentUrl: item.requirementDocumentUrl,
            photoUrl: item.photoUrl,
            moderationNote: item.moderationNote,
            submissionDate: formatSubmissionDate(item.createdAt),
            status: mapApprovalStatus(item.approvalStatus),
          }),
        );

        console.log("MAPPED PENDING TOUR PACKAGES:", mappedPackages);

        if (!isMounted) return;
        setTourPackageApprovals(mappedPackages);
      } catch (error) {
        if (!isMounted) return;

        setTourPackageApprovals([]);
        setErrorPendingTourPackages(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pending package",
        );
      } finally {
        if (!isMounted) return;
        setLoadingPendingTourPackages(false);
      }
    };

    loadPendingTourPackages();

    return () => {
      isMounted = false;
    };
  }, [loginUser, token]);

  useEffect(() => {
    if (!detailItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [detailItem]);

  useEffect(() => {
    if (loginUser?.role !== "ADMIN" || !token) {
      setDeletionRequests([]);
      setErrorDeletionRequests(null);
      return;
    }

    let isMounted = true;

    const loadDeletionRequests = async () => {
      try {
        setLoadingDeletionRequests(true);
        setErrorDeletionRequests(null);

        const response = await fetchDeletionRequests(token, 0, 10);

        const mappedItems: DeletionRequestItem[] = response.items.map(
          (item) => ({
            id: item.id,
            packageName: item.name || "-",
            businessName: "-",
            requestor: "-",
            submissionDate: formatDeletionDate(item.deletionRequestedAt),
            changeType: "HAPUS",
            category: formatCategoryLabel(item.category),
            price: formatCurrency(item.price),
            duration: item.duration,
            availability: item.availability,
            itinerary: item.itinerary ?? [],
            included: item.included ?? [],
            termsAndConditions: item.termsAndConditions || "-",
            pricingPolicy: item.pricingPolicy || "-",
            cancellationPolicy: item.cancellationPolicy || "-",
            deletionRequestReason: item.deletionRequestReason || "-",
            deletionReviewNote: item.deletionReviewNote || "-",
            moderationNote: item.moderationNote || "-",
            status: mapDeletionStatus(item.deletionRequestStatus),
          }),
        );

        console.log("MAPPED DELETION REQUESTS:", mappedItems);

        if (!isMounted) return;
        setDeletionRequests(mappedItems);
      } catch (error) {
        if (!isMounted) return;

        setDeletionRequests([]);
        setErrorDeletionRequests(
          error instanceof Error
            ? error.message
            : "Gagal mengambil deletion requests",
        );
      } finally {
        if (!isMounted) return;
        setLoadingDeletionRequests(false);
      }
    };

    loadDeletionRequests();

    return () => {
      isMounted = false;
    };
  }, [loginUser, token]);

  const partnerApprovals: PartnerApprovalItem[] = useMemo(() => {
    return pendingVendors.map((item) => ({
      id: item.userId,
      businessName: item.vendorName || "-",
      businessType: "-",
      requestor: item.username || "-",
      username: item.username || "-",
      email: item.email || "-",
      phone: item.phone || "-",
      address: item.address || "-",
      ktpNumber: item.ktpNumber || "-",
      submissionDate: "-",
      documentStatus: "All uploaded",
      status: partnerStatusMap[item.userId] ?? "pending",
    }));
  }, [pendingVendors, partnerStatusMap]);

  const filteredPartnerApprovals = useMemo(() => {
    const keyword = partnerSearch.trim().toLowerCase();

    if (!keyword) return partnerApprovals;

    return partnerApprovals.filter((item) =>
      [
        item.id,
        item.businessName,
        item.requestor,
        item.businessType,
        item.documentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [partnerApprovals, partnerSearch]);

  const openActionModal = (
    section: ApprovalSection,
    id: string,
    action: ApprovalAction,
  ) => {
    setSelectedItem({ section, id });
    setModalType(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async (password: string, reason: string) => {
    if (!selectedItem) return;

    const trimmedPassword = password.trim();
    const trimmedReason = reason.trim();

    if (!trimmedPassword) {
      alert("Password wajib diisi.");
      return;
    }

    if (!trimmedReason) {
      alert("Reason wajib diisi.");
      return;
    }

    if (!sessionPassword) {
      alert("Session password tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (trimmedPassword !== sessionPassword) {
      alert("Password admin tidak sesuai.");
      return;
    }

    console.log("APPROVAL VALIDATION SUCCESS:", {
      selectedItem,
      modalType,
      enteredPassword: trimmedPassword,
      storedPassword: sessionPassword,
      reason: trimmedReason,
    });

    if (selectedItem.section === "partner" && modalType === "approve") {
      const resultAction = await dispatch(
        approvePendingVendor({ userId: selectedItem.id }),
      );

      console.log("APPROVE PARTNER RESULT ACTION:", resultAction);

      if (approvePendingVendor.fulfilled.match(resultAction)) {
        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      }

      alert(
        typeof resultAction.payload === "string"
          ? resultAction.payload
          : "Gagal approve vendor",
      );
      return;
    }

    if (selectedItem.section === "partner" && modalType === "reject") {
      const resultAction = await dispatch(
        rejectPendingVendor({ userId: selectedItem.id }),
      );

      console.log("REJECT PARTNER RESULT ACTION:", resultAction);

      if (rejectPendingVendor.fulfilled.match(resultAction)) {
        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      }

      alert(
        typeof resultAction.payload === "string"
          ? resultAction.payload
          : "Gagal reject vendor",
      );
      return;
    }

    if (selectedItem.section === "tour" && modalType === "approve") {
      if (!token) {
        alert("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      try {
        setApprovingTourPackage(true);

        await approvePendingTourPackage(token, selectedItem.id, trimmedReason);

        setTourPackageApprovals((prev) =>
          prev.filter((item) => item.id !== selectedItem.id),
        );

        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      } catch (error) {
        alert(error instanceof Error ? error.message : "Gagal approve package");
        return;
      } finally {
        setApprovingTourPackage(false);
      }
    }

    if (selectedItem.section === "tour" && modalType === "reject") {
      if (!token) {
        alert("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      try {
        setRejectingTourPackage(true);

        await rejectPendingTourPackage(token, selectedItem.id, trimmedReason);

        setTourPackageApprovals((prev) =>
          prev.filter((item) => item.id !== selectedItem.id),
        );

        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      } catch (error) {
        alert(error instanceof Error ? error.message : "Gagal reject package");
        return;
      } finally {
        setRejectingTourPackage(false);
      }
    }

    const nextStatus: ApprovalStatus =
      modalType === "approve" ? "approved" : "rejected";

    if (selectedItem.section === "deletion" && modalType === "approve") {
      if (!token) {
        alert("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      try {
        setApprovingDeletionRequest(true);

        await approveDeletionRequest(token, selectedItem.id, trimmedReason);

        setDeletionRequests((prev) =>
          prev.filter((item) => item.id !== selectedItem.id),
        );

        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Gagal approve deletion request",
        );
        return;
      } finally {
        setApprovingDeletionRequest(false);
      }
    }

    if (selectedItem.section === "deletion" && modalType === "reject") {
      if (!token) {
        alert("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      try {
        setRejectingDeletionRequest(true);

        await rejectDeletionRequest(token, selectedItem.id, trimmedReason);

        setDeletionRequests((prev) =>
          prev.filter((item) => item.id !== selectedItem.id),
        );

        setConfirmOpen(false);
        setSuccessOpen(true);
        return;
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Gagal reject deletion request",
        );
        return;
      } finally {
        setRejectingDeletionRequest(false);
      }
    }

    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            A. Antrian Persetujuan Mitra
          </h2>

          <ApprovalTable
            title="Manajemen Persetujuan"
            searchValue={partnerSearch}
            onSearchChange={setPartnerSearch}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">
                    Status Dokumen
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingPendingVendors ? (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Memuat data pending vendor...
                    </TableCell>
                  </TableRow>
                ) : errorPendingVendors ? (
                  <TableRow>
                    <TableCell className="text-center text-red-500" colSpan={8}>
                      {errorPendingVendors}
                    </TableCell>
                  </TableRow>
                ) : filteredPartnerApprovals.length > 0 ? (
                  filteredPartnerApprovals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{formatShortId(item.id)}..</TableCell>
                      <TableCell>{item.businessName}</TableCell>
                      <TableCell>{item.businessType}</TableCell>
                      <TableCell>{item.requestor}</TableCell>
                      <TableCell>{item.submissionDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {item.documentStatus}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              openDetailModal({ section: "partner", item })
                            }
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("partner", item.id, "approve")
                            }
                            disabled={
                              item.status !== "pending" || approvingVendor
                            }
                          >
                            {approvingVendor ? "Memproses..." : "Setujui"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("partner", item.id, "reject")
                            }
                            disabled={
                              item.status !== "pending" || rejectingVendor
                            }
                          >
                            {rejectingVendor ? "Memproses..." : "Tolak"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            B. Antrian Persetujuan Paket Wisata
          </h2>

          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Nama Mitra</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Harga</TableHead>
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingPendingTourPackages ? (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={9}
                    >
                      Memuat data pending package...
                    </TableCell>
                  </TableRow>
                ) : errorPendingTourPackages ? (
                  <TableRow>
                    <TableCell className="text-center text-red-500" colSpan={9}>
                      {errorPendingTourPackages}
                    </TableCell>
                  </TableRow>
                ) : tourPackageApprovals.length > 0 ? (
                  tourPackageApprovals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{formatShortId(item.id)}..</TableCell>
                      <TableCell>{item.packageName}</TableCell>
                      <TableCell>{item.partnerName}</TableCell>
                      <TableCell>{item.requestor}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.submissionDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              openDetailModal({ section: "tour", item })
                            }
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("tour", item.id, "approve")
                            }
                            disabled={
                              item.status !== "pending" || approvingTourPackage
                            }
                          >
                            {approvingTourPackage ? "Memproses..." : "Setujui"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("tour", item.id, "reject")
                            }
                            disabled={
                              item.status !== "pending" || rejectingTourPackage
                            }
                          >
                            {rejectingTourPackage ? "Memproses..." : "Tolak"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={9}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            C. Permintaan Penghapusan / Pembaruan
          </h2>

          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">
                    Jenis Perubahan
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingDeletionRequests ? (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Memuat data deletion request...
                    </TableCell>
                  </TableRow>
                ) : errorDeletionRequests ? (
                  <TableRow>
                    <TableCell className="text-center text-red-500" colSpan={8}>
                      {errorDeletionRequests}
                    </TableCell>
                  </TableRow>
                ) : deletionRequests.length > 0 ? (
                  deletionRequests.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{formatShortId(item.id)}..</TableCell>
                      <TableCell>{item.packageName}</TableCell>
                      <TableCell>{item.businessName}</TableCell>
                      <TableCell>{item.requestor}</TableCell>
                      <TableCell>{item.submissionDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          {item.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              openDetailModal({ section: "deletion", item })
                            }
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("deletion", item.id, "approve")
                            }
                            disabled={
                              item.status !== "pending" ||
                              approvingDeletionRequest
                            }
                          >
                            {approvingDeletionRequest
                              ? "Memproses..."
                              : "Setujui"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("deletion", item.id, "reject")
                            }
                            disabled={
                              item.status !== "pending" ||
                              rejectingDeletionRequest
                            }
                          >
                            {rejectingDeletionRequest
                              ? "Memproses..."
                              : "Tolak"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>
      </div>

      <ApprovalModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        type={modalType}
        mode="confirm"
        onConfirm={handleConfirm}
      />

      <ApprovalModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type={modalType}
        mode="success"
      />

      <ApprovalDetailModal detail={detailItem} onClose={closeDetailModal} />
    </DashboardLayout>
  );
}
