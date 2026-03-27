"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, MinusCircle, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type TourPackageActionMode = "create" | "edit" | "delete" | "view";
export type TourPackageSubmitAction = Exclude<TourPackageActionMode, "view">;

export type TourPackageFormValue = {
  id: string;
  title: string;
  category: string;
  price: string;
  duration: string;
  availability: string;
  itineraryItems: string[];
  includedItems: string[];
  requiredDocumentLabel: string;
  requiredDocumentFileName: string;
  requiredDocumentFile: File | null;
  coverImageName: string;
  coverImageFile: File | null;
  imageUrl?: string;
  termsAndConditions?: string;
  pricingPolicy?: string;
  cancellationPolicy?: string;
  requirementDocumentUrl?: string | null;
  approvalStatus?: string;
  vendorId?: string;
  businessId?: string;
  rejectionReason?: string | null;
  moderationNote?: string | null;
  deletionRequestStatus?: string;
  deletionRequestReason?: string | null;
  deletionReviewNote?: string | null;
  deletionReviewerId?: string | null;
  deletionRequestedAt?: string | null;
  deletionReviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletionReason?: string;
};

export type TourPackageCompletePayload = {
  action: TourPackageSubmitAction;
  values: TourPackageFormValue;
};

type TourPackageFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TourPackageActionMode;
  initialData?: TourPackageFormValue | null;
  onComplete: (payload: TourPackageCompletePayload) => void | Promise<void>;
};

type TourPackageErrors = Partial<
  Record<
    | "title"
    | "category"
    | "price"
    | "duration"
    | "availability"
    | "itineraryItems"
    | "includedItems"
    | "requiredDocumentLabel"
    | "requiredDocumentFile"
    | "coverImageFile"
    | "deletionReason",
    string
  >
>;

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
};

type SuccessState = {
  open: boolean;
  title: string;
  description: string;
};

const categoryOptions = [
  { value: "ECO", label: "Eco" },
  { value: "ADVENTURE", label: "Adventure" },
  { value: "NATURE", label: "Nature" },
  { value: "CULTURE", label: "Culture" },
];

const emptyForm: TourPackageFormValue = {
  id: "",
  title: "",
  category: "",
  price: "",
  duration: "",
  availability: "",
  itineraryItems: [""],
  includedItems: [""],
  requiredDocumentLabel: "Document",
  requiredDocumentFileName: "",
  requiredDocumentFile: null,
  coverImageName: "",
  coverImageFile: null,
  imageUrl: "",
  termsAndConditions: "",
  pricingPolicy: "",
  cancellationPolicy: "",
  requirementDocumentUrl: null,
  approvalStatus: "",
  vendorId: "",
  businessId: "",
  rejectionReason: null,
  moderationNote: null,
  deletionRequestStatus: "",
  deletionRequestReason: null,
  deletionReviewNote: null,
  deletionReviewerId: null,
  deletionRequestedAt: null,
  deletionReviewedAt: null,
  createdAt: "",
  updatedAt: "",
  deletionReason: "",
};

const baseInputClassName =
  "h-12 w-full rounded-xl border border-blue-300 bg-background px-4 text-sm outline-none transition focus:border-blue-500";

function getInputClassName(disabled?: boolean) {
  return `${baseInputClassName}${
    disabled ? " bg-muted text-muted-foreground" : ""
  }`;
}

function formatCategoryLabel(value: string) {
  if (!value) return "-";

  return value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function formatCurrencyPreview(value: string) {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) return "IDR 0";
  return `IDR ${Number(normalized).toLocaleString("id-ID")}`;
}

function getDigitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function TourPackageFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onComplete,
}: TourPackageFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<TourPackageFormValue>(emptyForm);
  const [errors, setErrors] = useState<TourPackageErrors>({});
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    description: "",
  });
  const [successState, setSuccessState] = useState<SuccessState>({
    open: false,
    title: "",
    description: "",
  });
  const [pendingPayload, setPendingPayload] =
    useState<TourPackageCompletePayload | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isDeleteMode = mode === "delete";
  const isViewMode = mode === "view";
  const isReadOnly = isDeleteMode || isViewMode;

  useEffect(() => {
    if (!open) return;

    if (
      (mode === "edit" || mode === "delete" || mode === "view") &&
      initialData
    ) {
      setForm({
        ...emptyForm,
        ...initialData,
        requiredDocumentLabel:
          mode === "delete"
            ? "Product Deletion Request Form"
            : initialData.requiredDocumentLabel || "Required Document",
        itineraryItems:
          initialData.itineraryItems?.length > 0
            ? initialData.itineraryItems
            : [""],
        includedItems:
          initialData.includedItems?.length > 0
            ? initialData.includedItems
            : [""],
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
    setConfirmState({ open: false, title: "", description: "" });
    setSuccessState({ open: false, title: "", description: "" });
    setPendingPayload(null);
    setSubmitting(false);
    setSubmitError(null);
  }, [open, mode, initialData]);

  const handleChange = (field: keyof TourPackageFormValue, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field as keyof TourPackageErrors]: undefined,
    }));
  };

  const handleArrayChange = (
    field: "itineraryItems" | "includedItems",
    index: number,
    value: string,
  ) => {
    if (isReadOnly) return;

    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, idx) => (idx === index ? value : item)),
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const addArrayItem = (field: "itineraryItems" | "includedItems") => {
    if (isReadOnly) return;

    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "itineraryItems" | "includedItems") => {
    if (isReadOnly) return;

    setForm((prev) => {
      if (prev[field].length <= 1) return prev;

      return {
        ...prev,
        [field]: prev[field].slice(0, -1),
      };
    });
  };

  const validate = () => {
    const nextErrors: TourPackageErrors = {};

    if (!isDeleteMode) {
      if (!form.title.trim())
        nextErrors.title = "Please enter your tour package name.";
      if (!form.category.trim())
        nextErrors.category = "Please select your category.";
      if (!form.price.trim())
        nextErrors.price = "Please enter your package price.";
      if (!form.duration.trim())
        nextErrors.duration = "Please enter your package duration.";
      if (!form.availability.trim())
        nextErrors.availability = "Please enter your package availability.";
      if (isDeleteMode && !form.deletionReason?.trim()) {
        nextErrors.deletionReason = "Please enter deletion reason.";
      }

      if (
        form.itineraryItems.filter((item) => item.trim() !== "").length === 0
      ) {
        nextErrors.itineraryItems = "Please enter your tour package itinerary.";
      }

      if (
        form.includedItems.filter((item) => item.trim() !== "").length === 0
      ) {
        nextErrors.includedItems = "Please enter your tour package included.";
      }
    }

    if (!form.requiredDocumentLabel.trim()) {
      nextErrors.requiredDocumentLabel =
        "Please enter required document label.";
    }
    if (mode === "create") {
      if (!form.requiredDocumentFile) {
        nextErrors.requiredDocumentFile = "Please upload required document.";
      }

      if (!form.coverImageFile) {
        nextErrors.coverImageFile = "Please upload cover image.";
      }
    }

    return nextErrors;
  };

  const openConfirm = () => {
    if (isViewMode) {
      onOpenChange(false);
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: TourPackageFormValue = {
      ...form,
      id: form.id || `pkg-${Date.now()}`,
      itineraryItems: form.itineraryItems.filter((item) => item.trim() !== ""),
      includedItems: form.includedItems.filter((item) => item.trim() !== ""),
    };

    const nextAction: TourPackageSubmitAction =
      mode === "delete" ? "delete" : mode === "edit" ? "edit" : "create";

    setPendingPayload({
      action: nextAction,
      values: payload,
    });

    setConfirmState({
      open: true,
      title:
        mode === "delete"
          ? "Are you sure you want to request deletion?"
          : "Are you sure you want to save these changes?",
      description:
        "Please ensure all required information is correct before submitting.",
    });
  };

  const handleConfirmYes = async () => {
    if (!pendingPayload) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      console.log("PARTNER TOUR PACKAGE FORM VALUES:", form);
      console.log("PARTNER TOUR PACKAGE API PAYLOAD:", pendingPayload);

      await onComplete(pendingPayload);

      setConfirmState((prev) => ({ ...prev, open: false }));

      if (pendingPayload.action === "create") {
        setSuccessState({
          open: true,
          title: "Successfully added",
          description:
            "Verification takes 1–2 business days after submission. Admin will notify you via email once your package is approved.",
        });
      } else if (pendingPayload.action === "edit") {
        setSuccessState({
          open: true,
          title: "Successfully updated",
          description:
            "Verification takes 1–2 business days after submission. Admin will notify you via email once your package update is approved.",
        });
      } else {
        setSuccessState({
          open: true,
          title: "Deletion request submitted",
          description:
            "Verification takes 1–2 business days after submission. Admin will notify you via email once your deletion request is approved.",
        });
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal submit package",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessOk = () => {
    setSuccessState((prev) => ({ ...prev, open: false }));
    setPendingPayload(null);
    onOpenChange(false);
  };

  const renderArrayField = (
    label: string,
    field: "itineraryItems" | "includedItems",
    error?: string,
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="rounded-xl border border-blue-300 bg-background p-3">
        <div className="space-y-2">
          {form[field].map((item, index) => (
            <input
              key={`${field}-${index}`}
              value={item}
              disabled={isReadOnly}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              placeholder={
                field === "itineraryItems"
                  ? index === 0
                    ? "Enter your tour package itinerary"
                    : "Add itinerary item"
                  : index === 0
                    ? "Enter your tour package included"
                    : "Add included item"
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-blue-400 disabled:bg-muted disabled:text-muted-foreground"
            />
          ))}
        </div>

        {!isViewMode && (
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => addArrayItem(field)}
              disabled={isReadOnly}
              className="inline-flex items-center justify-center rounded-full text-green-600 transition hover:scale-105 disabled:opacity-40"
            >
              <PlusCircle className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => removeArrayItem(field)}
              disabled={isReadOnly}
              className="inline-flex items-center justify-center rounded-full text-yellow-500 transition hover:scale-105 disabled:opacity-40"
            >
              <MinusCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );

  const primaryButtonLabel =
    mode === "delete" ? "Delete" : mode === "view" ? "Close" : "Save";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-border p-0 sm:max-w-5xl [&>button]:hidden">
        <DialogTitle className="sr-only">
          {mode === "create"
            ? "Add New Tour Package"
            : mode === "edit"
              ? "Edit Tour Package"
              : mode === "delete"
                ? "Delete Tour Package"
                : "Tour Package Details"}
        </DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-20 rounded-full bg-red-500 p-1 text-white shadow"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="hide-scrollbar max-h-[85vh] overflow-y-auto px-8 py-8 md:px-12">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "create"
                  ? "Add New Tour Package"
                  : mode === "edit"
                    ? "Edit Tour Package"
                    : mode === "delete"
                      ? "Delete Tour Package"
                      : "Tour Package Details"}
              </h2>

              {form.approvalStatus && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Approval Status:{" "}
                  <span className="font-medium text-foreground">
                    {form.approvalStatus}
                  </span>
                </p>
              )}
            </div>

            {mode !== "create" && form.category && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {formatCategoryLabel(form.category)}
              </span>
            )}
          </div>

          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-muted">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.title || "Tour Package"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isReadOnly) fileInputRef.current?.click();
                  }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </button>
              )}
            </div>

            <p className="text-base text-muted-foreground">
              {form.coverImageName || "Upload cover image"}
            </p>
            {errors.coverImageFile && (
              <p className="mt-2 text-sm text-red-500">
                {errors.coverImageFile}
              </p>
            )}

            {!isViewMode && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setForm((prev) => ({
                    ...prev,
                    coverImageName: file.name,
                    coverImageFile: file,
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    coverImageFile: undefined,
                  }));

                  console.log("TOUR PACKAGE COVER IMAGE:", file);
                }}
              />
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tour Package Name*
                </label>
                <input
                  value={form.title}
                  disabled={isReadOnly}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter your tour package name"
                  className={getInputClassName(isReadOnly)}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category*
                </label>
                <select
                  value={form.category}
                  disabled={isReadOnly}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={getInputClassName(isReadOnly)}
                >
                  <option value="">Select your tour package category</option>
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (per person)*
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Numbers only
                </p>
                <input
                  value={form.price}
                  disabled={isReadOnly}
                  inputMode="numeric"
                  onChange={(e) =>
                    handleChange("price", getDigitsOnly(e.target.value))
                  }
                  placeholder="Enter your tour package price"
                  className={getInputClassName(isReadOnly)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Preview: {formatCurrencyPreview(form.price)}
                </p>
                {errors.price && (
                  <p className="mt-2 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Duration*
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter number of days only
                </p>
                <input
                  value={form.duration}
                  disabled={isReadOnly}
                  inputMode="numeric"
                  onChange={(e) =>
                    handleChange("duration", getDigitsOnly(e.target.value))
                  }
                  placeholder="Enter your tour package duration"
                  className={getInputClassName(isReadOnly)}
                />
                {errors.duration && (
                  <p className="mt-2 text-sm text-red-500">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Availability*
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter available quota only
                </p>
                <input
                  value={form.availability}
                  disabled={isReadOnly}
                  inputMode="numeric"
                  onChange={(e) =>
                    handleChange("availability", getDigitsOnly(e.target.value))
                  }
                  placeholder="Enter your tour package availability"
                  className={getInputClassName(isReadOnly)}
                />
                {errors.availability && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.availability}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Terms & Conditions
                </label>
                <textarea
                  value={form.termsAndConditions ?? ""}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    handleChange("termsAndConditions", e.target.value)
                  }
                  placeholder="Enter terms & conditions"
                  className="min-h-[110px] w-full rounded-xl border border-blue-300 bg-background px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Pricing Policy
                </label>
                <textarea
                  value={form.pricingPolicy ?? ""}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    handleChange("pricingPolicy", e.target.value)
                  }
                  placeholder="Enter pricing policy"
                  className="min-h-[110px] w-full rounded-xl border border-blue-300 bg-background px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cancellation Policy
                </label>
                <textarea
                  value={form.cancellationPolicy ?? ""}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    handleChange("cancellationPolicy", e.target.value)
                  }
                  placeholder="Enter cancellation policy"
                  className="min-h-[110px] w-full rounded-xl border border-blue-300 bg-background px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-5">
              {renderArrayField(
                "Itinerary*",
                "itineraryItems",
                errors.itineraryItems,
              )}

              {renderArrayField(
                "Included*",
                "includedItems",
                errors.includedItems,
              )}

              {isDeleteMode && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Deletion Reason*
                  </label>
                  <textarea
                    value={form.deletionReason ?? ""}
                    onChange={(e) =>
                      handleChange("deletionReason", e.target.value)
                    }
                    placeholder="Enter reason for deletion request"
                    className="min-h-[120px] w-full rounded-xl border border-blue-300 bg-background px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                  {errors.deletionReason && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.deletionReason}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Required Document*
                </label>

                <div className="flex flex-col gap-3 rounded-xl border border-blue-300 bg-background p-3 sm:flex-row sm:items-center">
                  <input
                    value={form.requiredDocumentLabel}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleChange("requiredDocumentLabel", e.target.value)
                    }
                    className="h-10 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-blue-400 disabled:bg-muted disabled:text-muted-foreground"
                  />

                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0"
                      onClick={() => {
                        if (!isReadOnly) documentInputRef.current?.click();
                      }}
                    >
                      Upload
                    </Button>
                  )}

                  {!isViewMode && (
                    <input
                      ref={documentInputRef}
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setForm((prev) => ({
                          ...prev,
                          requiredDocumentFileName: file.name,
                          requiredDocumentFile: file,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          requiredDocumentFile: undefined,
                        }));

                        console.log("TOUR PACKAGE REQUIRED DOCUMENT:", file);
                      }}
                    />
                  )}
                </div>

                {form.requiredDocumentFileName && (
                  <p className="mt-2 truncate text-sm text-muted-foreground">
                    {form.requiredDocumentFileName}
                  </p>
                )}

                {form.requirementDocumentUrl && (
                  <a
                    href={form.requirementDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block truncate text-sm text-blue-600 hover:underline"
                  >
                    Open uploaded document
                  </a>
                )}
                {errors.requiredDocumentFile && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.requiredDocumentFile}
                  </p>
                )}

                {errors.requiredDocumentLabel && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.requiredDocumentLabel}
                  </p>
                )}
              </div>

              {(form.rejectionReason || form.moderationNote) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Review Notes
                  </p>

                  {form.rejectionReason && (
                    <p className="mt-2 text-sm text-amber-700">
                      Rejection Reason: {form.rejectionReason}
                    </p>
                  )}

                  {form.moderationNote && (
                    <p className="mt-2 text-sm text-amber-700">
                      Moderation Note: {form.moderationNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="min-w-[180px]"
              onClick={() => onOpenChange(false)}
            >
              {isViewMode ? "Close" : "Cancel"}
            </Button>

            {!isViewMode && (
              <Button
                type="button"
                onClick={openConfirm}
                className={
                  mode === "delete"
                    ? "min-w-[180px] bg-red-500 hover:bg-red-600"
                    : "min-w-[180px] bg-blue-500 hover:bg-blue-600"
                }
              >
                {primaryButtonLabel}
              </Button>
            )}
          </div>
        </div>

        {confirmState.open && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px] p-4">
            <div className="w-full max-w-[360px] rounded-[24px] border border-border bg-background p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-foreground">
                {confirmState.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {confirmState.description}
              </p>

              {submitError && (
                <p className="mt-3 text-sm text-red-500">{submitError}</p>
              )}

              <div className="mt-5 flex gap-3">
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={handleConfirmYes}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Yes"}
                </Button>

                <Button
                  variant="secondary"
                  className="flex-1 bg-red-100 text-red-500 hover:bg-red-200"
                  onClick={() =>
                    setConfirmState((prev) => ({ ...prev, open: false }))
                  }
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {successState.open && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px] p-4">
            <div className="w-full max-w-[360px] rounded-[24px] border border-border bg-background p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-foreground">
                {successState.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {successState.description}
              </p>

              <div className="mt-5">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={handleSuccessOk}
                >
                  Oke
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
