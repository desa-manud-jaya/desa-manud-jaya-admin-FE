"use client";

import { useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  PARTNER_BUSINESS_TYPE_OPTIONS,
  partnerBusinessProfileMock,
  type PartnerBusinessProfile,
} from "@/lib/partner-mock";

type BusinessProfileErrors = Partial<
  Record<keyof PartnerBusinessProfile, string>
>;

const inputClassName =
  "h-12 w-full rounded-xl border border-border bg-muted/40 px-4 text-base outline-none focus:border-blue-400";

export default function BusinessProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PartnerBusinessProfile>(partnerBusinessProfileMock);
  const [errors, setErrors] = useState<BusinessProfileErrors>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validate = () => {
    const nextErrors: BusinessProfileErrors = {};

    if (!form.businessName.trim()) nextErrors.businessName = "Business name wajib diisi.";
    if (!form.ownerName.trim()) nextErrors.ownerName = "Owner name wajib diisi.";
    if (!/^\d{16}$/.test(form.nik.trim())) nextErrors.nik = "Masukkan NIK 16 digit yang valid.";
    if (!form.businessType.trim()) nextErrors.businessType = "Business type wajib dipilih.";
    if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
    if (!form.nib.trim()) nextErrors.nib = "Masukkan NIB.";
    if (!form.bankAccountName.trim()) nextErrors.bankAccountName = "Nama rekening wajib diisi.";
    if (!form.phone.trim()) nextErrors.phone = "Nomor telepon wajib diisi.";
    if (!form.sku.trim()) nextErrors.sku = "Masukkan SKU.";
    if (!form.bankAccountNumber.trim()) nextErrors.bankAccountNumber = "Nomor rekening wajib diisi.";
    if (!form.businessAddress.trim()) nextErrors.businessAddress = "Alamat usaha wajib diisi.";
    if (!form.siup.trim()) nextErrors.siup = "Masukkan SIUP.";

    return nextErrors;
  };

  const handleChange = (
    field: keyof PartnerBusinessProfile,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      nik: form.nik,
      businessType: form.businessType,
      email: form.email,
      nib: form.nib,
      bankAccountName: form.bankAccountName,
      phone: form.phone,
      sku: form.sku,
      bankAccountNumber: form.bankAccountNumber,
      businessAddress: form.businessAddress,
      siup: form.siup,
      sustainabilityCertification: form.sustainabilityCertification,
      statusAccount: form.statusAccount,
      logoUrl: form.logoUrl,
    };

    console.log("PARTNER BUSINESS PROFILE FORM VALUES:", form);
    console.log("PARTNER BUSINESS PROFILE API PAYLOAD:", payload);

    // TODO:
    // Ganti ke API call saat backend sudah siap.
    // await fetch("/api/partner/business-profile", { method: "POST", body: JSON.stringify(payload) })

    setIsEditing(false);
    setErrors({});
  };

  const renderError = (field: keyof PartnerBusinessProfile) =>
    errors[field] ? (
      <p className="mt-2 text-sm text-red-500">{errors[field]}</p>
    ) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-8 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="rounded-lg p-2 text-foreground transition hover:bg-muted"
              aria-label="Toggle edit"
            >
              <Pencil className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-10 flex flex-col items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>

            <button
              type="button"
              disabled={!isEditing}
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-base font-medium text-blue-500 disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              Upload Logo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                console.log("PARTNER LOGO FILE:", file);
                handleChange("logoUrl", file.name);
              }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Business Name*</label>
              <input
                value={form.businessName}
                disabled={!isEditing}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className={inputClassName}
              />
              {renderError("businessName")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Owner Name*</label>
              <input
                value={form.ownerName}
                disabled={!isEditing}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                className={inputClassName}
              />
              {renderError("ownerName")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">NIK*</label>
              <input
                value={form.nik}
                disabled={!isEditing}
                onChange={(e) => handleChange("nik", e.target.value)}
                className={inputClassName}
                placeholder="Enter your NIK"
              />
              {renderError("nik")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Business Type*</label>
              <select
                value={form.businessType}
                disabled={!isEditing}
                onChange={(e) => handleChange("businessType", e.target.value)}
                className={inputClassName}
              >
                <option value="">Pilih jenis usaha</option>
                {PARTNER_BUSINESS_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {renderError("businessType")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email*</label>
              <input
                value={form.email}
                disabled={!isEditing}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClassName}
              />
              {renderError("email")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">NIB*</label>
              <input
                value={form.nib}
                disabled={!isEditing}
                onChange={(e) => handleChange("nib", e.target.value)}
                className={inputClassName}
                placeholder="Enter your NIB"
              />
              {renderError("nib")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Bank Account Name*</label>
              <input
                value={form.bankAccountName}
                disabled={!isEditing}
                onChange={(e) => handleChange("bankAccountName", e.target.value)}
                className={inputClassName}
              />
              {renderError("bankAccountName")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Phone*</label>
              <input
                value={form.phone}
                disabled={!isEditing}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={inputClassName}
              />
              {renderError("phone")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">SKU*</label>
              <input
                value={form.sku}
                disabled={!isEditing}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={inputClassName}
                placeholder="Enter your SKU"
              />
              {renderError("sku")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Bank Account Number*</label>
              <input
                value={form.bankAccountNumber}
                disabled={!isEditing}
                onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                className={inputClassName}
              />
              {renderError("bankAccountNumber")}
            </div>

            <div className="lg:row-span-2">
              <label className="mb-2 block text-sm font-medium">Business Address*</label>
              <textarea
                value={form.businessAddress}
                disabled={!isEditing}
                onChange={(e) => handleChange("businessAddress", e.target.value)}
                className="min-h-[130px] w-full rounded-xl border border-border bg-muted/40 p-4 text-base outline-none focus:border-blue-400"
              />
              {renderError("businessAddress")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">SIUP*</label>
              <input
                value={form.siup}
                disabled={!isEditing}
                onChange={(e) => handleChange("siup", e.target.value)}
                className={inputClassName}
                placeholder="Enter your SIUP"
              />
              {renderError("siup")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sustainability Certification
              </label>
              <input
                value={form.sustainabilityCertification}
                disabled={!isEditing}
                onChange={(e) =>
                  handleChange("sustainabilityCertification", e.target.value)
                }
                className={inputClassName}
                placeholder="-"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status Account</label>
              <input
                value={form.statusAccount}
                disabled
                className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-blue-500 px-10 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}