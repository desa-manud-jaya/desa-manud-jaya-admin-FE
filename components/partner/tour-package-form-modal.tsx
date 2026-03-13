"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, MinusCircle, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PartnerTourPackage } from "@/lib/partner-mock";

type TourPackageActionMode = "create" | "edit" | "delete";

type TourPackageFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TourPackageActionMode;
  initialData?: PartnerTourPackage | null;
  onComplete: (payload: {
    action: TourPackageActionMode;
    values: PartnerTourPackage;
  }) => void;
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
    | "requiredDocumentLabel",
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

const categories = ["Eco", "Adventure", "Nature", "Culture"];

const emptyForm: PartnerTourPackage = {
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
  coverImageName: "",
};

const baseInputClassName =
  "h-12 w-full rounded-xl border border-blue-300 bg-background px-4 text-sm outline-none transition focus:border-blue-500";

function getInputClassName(disabled?: boolean) {
  return `${baseInputClassName}${disabled ? " bg-muted text-muted-foreground" : ""}`;
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

  const [form, setForm] = useState<PartnerTourPackage>(emptyForm);
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
  const [pendingPayload, setPendingPayload] = useState<{
    action: TourPackageActionMode;
    values: PartnerTourPackage;
  } | null>(null);

  const isDeleteMode = mode === "delete";

  useEffect(() => {
    if (!open) return;

    if ((mode === "edit" || mode === "delete") && initialData) {
      setForm({
        ...initialData,
        requiredDocumentLabel:
          mode === "delete"
            ? "Product Deletion Request Form"
            : initialData.requiredDocumentLabel || "Safety Certification",
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
    setConfirmState({ open: false, title: "", description: "" });
    setSuccessState({ open: false, title: "", description: "" });
    setPendingPayload(null);
  }, [open, mode, initialData]);

  const handleChange = (field: keyof PartnerTourPackage, value: string) => {
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
    value: string
  ) => {
    if (isDeleteMode) return;

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
    if (isDeleteMode) return;

    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "itineraryItems" | "includedItems") => {
    if (isDeleteMode) return;

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
      if (!form.title.trim()) nextErrors.title = "Please enter your tour package name.";
      if (!form.category.trim()) nextErrors.category = "Please select your category.";
      if (!form.price.trim()) nextErrors.price = "Please enter your package price.";
      if (!form.duration.trim()) nextErrors.duration = "Please enter your package duration.";
      if (!form.availability.trim()) nextErrors.availability = "Please enter your package availability.";

      if (form.itineraryItems.filter((item) => item.trim() !== "").length === 0) {
        nextErrors.itineraryItems = "Please enter your tour package itinerary.";
      }

      if (form.includedItems.filter((item) => item.trim() !== "").length === 0) {
        nextErrors.includedItems = "Please enter your tour package included.";
      }
    }

    if (!form.requiredDocumentLabel.trim()) {
      nextErrors.requiredDocumentLabel = "Please enter required document label.";
    }

    return nextErrors;
  };

  const openConfirm = () => {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: PartnerTourPackage = {
      ...form,
      id: form.id || `pkg-${Date.now()}`,
      itineraryItems: form.itineraryItems.filter((item) => item.trim() !== ""),
      includedItems: form.includedItems.filter((item) => item.trim() !== ""),
    };

    setPendingPayload({
      action: mode,
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

  const handleConfirmYes = () => {
    if (!pendingPayload) return;

    console.log("PARTNER TOUR PACKAGE FORM VALUES:", form);
    console.log("PARTNER TOUR PACKAGE API PAYLOAD:", pendingPayload);

    onComplete(pendingPayload);
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
  };

  const handleSuccessOk = () => {
    setSuccessState((prev) => ({ ...prev, open: false }));
    setPendingPayload(null);
    onOpenChange(false);
  };

  const renderArrayField = (
    label: string,
    field: "itineraryItems" | "includedItems",
    error?: string
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="rounded-xl border border-blue-300 bg-background p-3">
        <div className="space-y-2">
          {form[field].map((item, index) => (
            <input
              key={`${field}-${index}`}
              value={item}
              disabled={isDeleteMode}
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

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => addArrayItem(field)}
            disabled={isDeleteMode}
            className="inline-flex items-center justify-center rounded-full text-green-600 transition hover:scale-105 disabled:opacity-40"
          >
            <PlusCircle className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => removeArrayItem(field)}
            disabled={isDeleteMode}
            className="inline-flex items-center justify-center rounded-full text-yellow-500 transition hover:scale-105 disabled:opacity-40"
          >
            <MinusCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );

  const primaryButtonLabel = mode === "delete" ? "Delete" : "Save";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-border p-0 sm:max-w-5xl [&>button]:hidden">
        <DialogTitle className="sr-only">
          {mode === "create"
            ? "Add New Tour Package"
            : mode === "edit"
            ? "Edit Tour Package"
            : "Delete Tour Package"}
        </DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-20 rounded-full bg-red-500 p-1 text-white shadow"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="hide-scrollbar max-h-[85vh] overflow-y-auto px-8 py-8 md:px-12">
          <div className="mb-8 flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                if (!isDeleteMode) fileInputRef.current?.click();
              }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
            >
              <Camera className="h-8 w-8 text-muted-foreground" />
            </button>

            <p className="mt-3 text-base text-muted-foreground">
              {form.coverImageName || "Upload cover image"}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleChange("coverImageName", file.name);
                console.log("TOUR PACKAGE COVER IMAGE:", file);
              }}
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Tour Package Name*</label>
                <input
                  value={form.title}
                  disabled={isDeleteMode}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter your tour package name"
                  className={getInputClassName(isDeleteMode)}
                />
                {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Category*</label>
                <select
                  value={form.category}
                  disabled={isDeleteMode}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={getInputClassName(isDeleteMode)}
                >
                  <option value="">Select your tour package category</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Price (per person)*</label>
                <input
                  value={form.price}
                  disabled={isDeleteMode}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="Enter your tour package price"
                  className={getInputClassName(isDeleteMode)}
                />
                {errors.price && <p className="mt-2 text-sm text-red-500">{errors.price}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Duration*</label>
                <input
                  value={form.duration}
                  disabled={isDeleteMode}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="Enter your tour package duration"
                  className={getInputClassName(isDeleteMode)}
                />
                {errors.duration && <p className="mt-2 text-sm text-red-500">{errors.duration}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Availability*</label>
                <input
                  value={form.availability}
                  disabled={isDeleteMode}
                  onChange={(e) => handleChange("availability", e.target.value)}
                  placeholder="Enter your tour package availability"
                  className={getInputClassName(isDeleteMode)}
                />
                {errors.availability && (
                  <p className="mt-2 text-sm text-red-500">{errors.availability}</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {renderArrayField("Itinerary*", "itineraryItems", errors.itineraryItems)}
              {renderArrayField("Included*", "includedItems", errors.includedItems)}

              <div>
                <label className="mb-2 block text-sm font-medium">Required Document*</label>

                <div className="flex flex-col gap-3 rounded-xl border border-blue-300 bg-background p-3 sm:flex-row sm:items-center">
                  <input
                    value={form.requiredDocumentLabel}
                    disabled={isDeleteMode}
                    onChange={(e) =>
                      handleChange("requiredDocumentLabel", e.target.value)
                    }
                    className="h-10 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-blue-400 disabled:bg-muted disabled:text-muted-foreground"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => {
                      if (!isDeleteMode) documentInputRef.current?.click();
                    }}
                  >
                    Upload
                  </Button>

                  <input
                    ref={documentInputRef}
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleChange("requiredDocumentFileName", file.name);
                      console.log("TOUR PACKAGE REQUIRED DOCUMENT:", file);
                    }}
                  />
                </div>

                {form.requiredDocumentFileName && (
                  <p className="mt-2 truncate text-sm text-muted-foreground">
                    {form.requiredDocumentFileName}
                  </p>
                )}

                {errors.requiredDocumentLabel && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.requiredDocumentLabel}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
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

              <div className="mt-5 flex gap-3">
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={handleConfirmYes}
                >
                  Yes
                </Button>

                <Button
                  variant="secondary"
                  className="flex-1 bg-red-100 text-red-500 hover:bg-red-200"
                  onClick={() =>
                    setConfirmState((prev) => ({ ...prev, open: false }))
                  }
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