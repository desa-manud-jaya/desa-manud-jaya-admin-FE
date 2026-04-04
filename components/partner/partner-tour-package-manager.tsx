"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Image as ImageIcon,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TourPackageFormModal,
  type TourPackageActionMode,
  type TourPackageCompletePayload,
  type TourPackageFormValue,
} from "@/components/partner/tour-package-form-modal";
import { useAppSelector } from "@/store/hooks";

type PackageRequestType = "ADD NEW" | "UPDATE" | "DELETION";
type PackageRequestStatus = "Processing" | "Approved" | "Rejected";

type PackageRequestRecord = {
  id: string;
  packageName: string;
  category: string;
  date: string;
  type: PackageRequestType;
  feedback: string;
  status: PackageRequestStatus;
};

type VendorPackageApiItem = {
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

function formatRequestDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatShortId(value: string) {
  if (!value) return "-";
  if (value.length <= 6) return value;
  return `${value.slice(0, 6)}..`;
}

function formatTrackingDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function normalizeNumberString(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[^\d]/g, "");
}

function formatCurrencyDisplay(value: string | number) {
  const normalized = normalizeNumberString(value);
  if (!normalized) return "IDR 0";

  return `IDR ${Number(normalized).toLocaleString("id-ID")}`;
}

function formatDurationDisplay(value: string | number) {
  const normalized = normalizeNumberString(value);
  if (!normalized) return "-";
  return `${normalized} Days`;
}

function formatCategoryLabel(value: string) {
  if (!value) return "-";

  return value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function mapApiPackageToFormValue(
  item: VendorPackageApiItem,
): TourPackageFormValue {
  return {
    id: item.id,
    title: item.name ?? "",
    category: item.category ?? "",
    price: String(item.price ?? ""),
    duration: String(item.duration ?? ""),
    availability: String(item.availability ?? ""),
    itineraryItems: item.itinerary ?? [""],
    includedItems: item.included ?? [""],
    requiredDocumentLabel: "Required Document",
    requiredDocumentFileName: "",
    requiredDocumentFile: null,
    coverImageName: "",
    coverImageFile: null,
    imageUrl: item.photoUrl ?? "",
    termsAndConditions: item.termsAndConditions ?? "",
    pricingPolicy: item.pricingPolicy ?? "",
    cancellationPolicy: item.cancellationPolicy ?? "",
    requirementDocumentUrl: item.requirementDocumentUrl ?? null,
    approvalStatus: item.approvalStatus ?? "",
    vendorId: item.vendorId ?? "",
    businessId: item.businessId ?? "",
    rejectionReason: item.rejectionReason,
    moderationNote: item.moderationNote,
    deletionRequestStatus: item.deletionRequestStatus ?? "",
    deletionRequestReason: item.deletionRequestReason,
    deletionReviewNote: item.deletionReviewNote,
    deletionReviewerId: item.deletionReviewerId,
    deletionRequestedAt: item.deletionRequestedAt,
    deletionReviewedAt: item.deletionReviewedAt,
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
    deletionReason: item.deletionRequestReason ?? "",
  };
}

async function fetchVendorPackages(
  token: string,
  businessId: string,
): Promise<VendorPackageApiItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/businesses/${businessId}/packages`,
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
    console.log(
      "GET /vendor/businesses/{businessId}/packages RAW RESPONSE:",
      data,
    );
  } catch {
    throw new Error(
      "Response /vendor/businesses/{businessId}/packages tidak valid",
    );
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil data tour package",
          )
        : "Gagal mengambil data tour package";

    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Format data package tidak sesuai");
  }

  return data as VendorPackageApiItem[];
}
async function createVendorPackage(
  token: string,
  businessId: string,
  values: TourPackageFormValue,
): Promise<VendorPackageApiItem> {
  if (!values.requiredDocumentFile) {
    throw new Error("Required document belum dipilih");
  }

  if (!values.coverImageFile) {
    throw new Error("Photo belum dipilih");
  }

  const dataPayload = {
    termsAndConditions: values.termsAndConditions?.trim() ?? "",
    price: Number(normalizeNumberString(values.price)),
    itinerary: values.itineraryItems.filter((item) => item.trim() !== ""),
    name: values.title.trim(),
    duration: Number(normalizeNumberString(values.duration)),
    cancellationPolicy: values.cancellationPolicy?.trim() ?? "",
    pricingPolicy: values.pricingPolicy?.trim() ?? "",
    availability: Number(normalizeNumberString(values.availability)),
    included: values.includedItems.filter((item) => item.trim() !== ""),
    category: values.category,
  };

  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(dataPayload)], {
      type: "application/json",
    }),
  );

  formData.append(
    "requirementDocument",
    values.requiredDocumentFile,
    values.requiredDocumentFile.name,
  );

  formData.append("photo", values.coverImageFile, values.coverImageFile.name);

  console.log("CREATE PACKAGE DATA PAYLOAD:", dataPayload);
  console.log(
    "CREATE PACKAGE REQUIREMENT DOCUMENT:",
    values.requiredDocumentFile,
  );
  console.log("CREATE PACKAGE PHOTO:", values.coverImageFile);

  for (const [key, value] of formData.entries()) {
    console.log("FORM DATA ENTRY:", key, value);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/businesses/${businessId}/packages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    },
  );

  const rawText = await response.text();

  console.log("POST PACKAGE RAW TEXT RESPONSE:", rawText);

  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message || "Gagal submit package",
          )
        : typeof data === "string" && data.trim() !== ""
          ? data
          : "Gagal submit package";

    throw new Error(message);
  }

  return data as VendorPackageApiItem;
}
async function updateVendorPackage(
  token: string,
  businessId: string,
  packageId: string,
  values: TourPackageFormValue,
): Promise<void> {
  const payload = {
    name: values.title.trim(),
    category: values.category,
    price: Number(normalizeNumberString(values.price)),
    duration: Number(normalizeNumberString(values.duration)),
    availability: Number(normalizeNumberString(values.availability)),
    itinerary: values.itineraryItems.filter((item) => item.trim() !== ""),
    included: values.includedItems.filter((item) => item.trim() !== ""),
    termsAndConditions: values.termsAndConditions?.trim() ?? "",
    pricingPolicy: values.pricingPolicy?.trim() ?? "",
    cancellationPolicy: values.cancellationPolicy?.trim() ?? "",
    moderationNote: values.moderationNote?.trim() ?? "",
  };

  console.log("UPDATE PACKAGE REQUEST:", {
    businessId,
    packageId,
    payload,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/businesses/${businessId}/packages/${packageId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const rawText = await response.text();
  console.log("UPDATE PACKAGE RAW RESPONSE:", rawText);

  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
      console.log("UPDATE PACKAGE JSON RESPONSE:", data);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal update tour package",
          )
        : typeof data === "string" && data.trim() !== ""
          ? data
          : "Gagal update tour package";

    throw new Error(message);
  }
}

async function requestVendorPackageDeletion(
  token: string,
  businessId: string,
  packageId: string,
  reason: string,
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/businesses/${businessId}/packages/${packageId}/deletion-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        reason: reason.trim(),
      }),
    },
  );

  const rawText = await response.text();

  console.log("DELETE PACKAGE REQUEST:", {
    businessId,
    packageId,
    reason,
  });
  console.log("DELETE PACKAGE RAW RESPONSE:", rawText);

  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
      console.log("DELETE PACKAGE JSON RESPONSE:", data);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengirim deletion request package",
          )
        : typeof data === "string" && data.trim() !== ""
          ? data
          : "Gagal mengirim deletion request package";

    throw new Error(message);
  }
}

export function PartnerTourPackageManager() {
  const token = useAppSelector((state) => state.auth.token);
  const businessId = useAppSelector((state) => state.auth.businessId);

  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  const [packages, setPackages] = useState<TourPackageFormValue[]>([]);
  const [requests, setRequests] = useState<PackageRequestRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<TourPackageFormValue | null>(null);
  const [actionMode, setActionMode] = useState<TourPackageActionMode>("create");

  const loadPackages = useCallback(async () => {
    if (!token || !businessId) {
      setPackages([]);
      setPackagesError(null);
      return;
    }

    try {
      setLoadingPackages(true);
      setPackagesError(null);

      const apiPackages = await fetchVendorPackages(token, businessId);
      console.log("API PACKAGES:", apiPackages);

      const filteredApiPackages = apiPackages.filter(
        (item) => item.deletionRequestStatus !== "APPROVED",
      );
      console.log("FILTERED API PACKAGES:", filteredApiPackages);

      const mappedPackages = filteredApiPackages.map(mapApiPackageToFormValue);
      console.log("MAPPED PACKAGES:", mappedPackages);

      setPackages(mappedPackages);
    } catch (error) {
      setPackages([]);
      setPackagesError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data tour package",
      );
    } finally {
      setLoadingPackages(false);
    }
  }, [token, businessId]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const trackingRequests = useMemo(() => {
    return packages
      .filter(
        (pkg) =>
          pkg.approvalStatus === "PENDING" ||
          pkg.deletionRequestStatus === "PENDING",
      )
      .map((pkg) => {
        const isDeletionPending = pkg.deletionRequestStatus === "PENDING";

        return {
          id: pkg.id,
          packageName: pkg.title,
          category: formatCategoryLabel(pkg.category),
          date: formatTrackingDate(
            isDeletionPending
              ? (pkg.deletionRequestedAt ?? pkg.updatedAt ?? pkg.createdAt)
              : (pkg.updatedAt ?? pkg.createdAt),
          ),
          type: isDeletionPending ? "DELETION" : "ADD NEW",
          feedback: isDeletionPending
            ? (pkg.deletionRequestReason ?? "-")
            : "-",
          status: "Processing" as PackageRequestStatus,
        };
      });
  }, [packages]);

  const openCreateModal = () => {
    setActionMode("create");
    setEditingPackage(null);
    setModalOpen(true);
  };

  const openViewModal = (pkg: TourPackageFormValue) => {
    setActionMode("view");
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const openEditModal = (pkg: TourPackageFormValue) => {
    setActionMode("edit");
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const openDeleteModal = (pkg: TourPackageFormValue) => {
    setActionMode("delete");
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const addRequestRecord = (
    values: TourPackageFormValue,
    type: PackageRequestType,
  ) => {
    const newRecord: PackageRequestRecord = {
      id: String(requests.length + 1).padStart(5, "0"),
      packageName: values.title,
      category: formatCategoryLabel(values.category),
      date: formatRequestDate(),
      type,
      feedback: "-",
      status: "Processing",
    };

    setRequests((prev) => [newRecord, ...prev]);
  };

  const handleCompleteAction = async ({
    action,
    values,
  }: TourPackageCompletePayload) => {
    if (action === "create") {
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      if (!businessId) {
        throw new Error("Business ID tidak ditemukan");
      }

      await createVendorPackage(token, businessId, values);
      await loadPackages();
      addRequestRecord(values, "ADD NEW");
      return;
    }

    if (action === "edit") {
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      if (!businessId) {
        throw new Error("Business ID tidak ditemukan");
      }

      await updateVendorPackage(token, businessId, values.id, values);
      await loadPackages();
      addRequestRecord(values, "UPDATE");
      return;
    }

    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    if (!businessId) {
      throw new Error("Business ID tidak ditemukan");
    }

    await requestVendorPackageDeletion(
      token,
      businessId,
      values.id,
      values.deletionReason?.trim() ?? "",
    );

    await loadPackages();
    addRequestRecord(values, "DELETION");
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-foreground">My Tour Package</h1>
      {!loadingPackages && !packagesError && packages.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
          Belum ada paket wisata.
        </div>
      )}

      {packages.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-3xl border border-border bg-background p-5 shadow-sm"
            >
              <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-muted/20">
                {pkg.imageUrl ? (
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>{formatDurationDisplay(pkg.duration)}</span>
              </div>

              <h2 className="mt-5 line-clamp-2 text-3xl font-bold text-foreground">
                {pkg.title}
              </h2>

              <p className="mt-2 text-4xl font-bold text-foreground">
                {formatCurrencyDisplay(pkg.price)}
                <span className="ml-2 text-2xl font-normal text-muted-foreground">
                  / Person
                </span>
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {formatCategoryLabel(pkg.category)}
                </span>

                <span className="text-sm text-muted-foreground">
                  Availability: {pkg.availability}
                </span>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 font-semibold uppercase text-muted-foreground">
                  Include:
                </p>

                <ul className="space-y-2 text-base text-foreground/80">
                  {pkg.includedItems.slice(0, 4).map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="mt-6 h-12 w-full rounded-xl bg-emerald-700 text-lg hover:bg-emerald-800"
                onClick={() => openViewModal(pkg)}
              >
                See Details →
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            My Tour Package List
          </h2>

          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={openCreateModal}
          >
            Add New Package
          </Button>
        </div>

        {loadingPackages && (
          <p className="mb-4 text-sm text-muted-foreground">
            Loading tour packages...
          </p>
        )}

        {packagesError && (
          <p className="mb-4 text-sm text-red-500">{packagesError}</p>
        )}

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 text-left text-sm font-semibold text-foreground">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Tour Package Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-border">
                  <td className="px-6 py-5">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">{pkg.title}</td>
                  <td className="px-6 py-5">
                    {formatCategoryLabel(pkg.category)}
                  </td>
                  <td className="px-6 py-5">
                    {formatCurrencyDisplay(pkg.price)}/Person
                  </td>
                  <td className="px-6 py-5">{pkg.availability}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(pkg)}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                      >
                        See Details
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(pkg)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(pkg)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {packages.length === 0 && !loadingPackages && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Belum ada paket wisata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-foreground">
          Tracking Progress Verification
        </h2>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center text-blue-600">
              <div className="h-5 w-5 rounded-full bg-blue-600" />
              <span className="mt-2 text-xs text-muted-foreground">Added</span>
            </div>

            <div className="mx-3 h-1 flex-1 bg-blue-300" />

            <div className="flex flex-col items-center text-yellow-500">
              <div className="h-5 w-5 rounded-full bg-yellow-500" />
              <span className="mt-2 text-xs text-muted-foreground">Review</span>
            </div>

            <div className="mx-3 h-1 flex-1 bg-border" />

            <div className="flex flex-col items-center text-muted-foreground">
              <div className="h-5 w-5 rounded-full border border-border bg-background" />
              <span className="mt-2 text-xs text-muted-foreground">
                Success
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 text-left text-sm font-semibold text-foreground">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">TOUR PACKAGE NAME</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">TYPE</th>
                <th className="px-6 py-4">FEEDBACK</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {trackingRequests.length > 0 ? (
                trackingRequests.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-6 py-5">{formatShortId(item.id)}</td>
                    <td className="px-6 py-5">{item.packageName}</td>
                    <td className="px-6 py-5">{item.category}</td>
                    <td className="px-6 py-5">{item.date}</td>
                    <td className="px-6 py-5">{item.type}</td>
                    <td className="px-6 py-5">{item.feedback}</td>
                    <td className="px-6 py-5">
                      <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    Belum ada request verifikasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 text-sm text-foreground">
          <p className="font-semibold">Notes</p>
          <p className="mt-2 text-muted-foreground">
            ⏳ Verification takes 1–2 business days after submission.
            <br />
            Admin will notify you via email once your account is approved.
          </p>
        </div>
      </div>

      <TourPackageFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={actionMode}
        initialData={editingPackage}
        onComplete={handleCompleteAction}
      />
    </div>
  );
}
