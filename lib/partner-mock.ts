import type { PartnerAccountStatus } from "@/lib/auth";

export type PartnerBusinessProfile = {
  businessName: string;
  ownerName: string;
  nik: string;
  businessType: string;
  email: string;
  nib: string;
  bankAccountName: string;
  phone: string;
  sku: string;
  bankAccountNumber: string;
  businessAddress: string;
  siup: string;
  sustainabilityCertification: string;
  statusAccount: PartnerAccountStatus;
  logoUrl?: string;
};

export type PartnerDocumentKey =
  | "ktp"
  | "nib"
  | "sku"
  | "siup"
  | "passbook"
  | "sustainabilityCertification";

export type PartnerDocumentItem = {
  key: PartnerDocumentKey;
  label: string;
  required: boolean;
  uploaded: boolean;
  verified: boolean;
  fileName?: string;
};

export type PartnerTourPackage = {
  id: string;
  title: string;
  category: string;
  price: string;
  duration: string;
  availability: string;
  itineraryItems: string[];
  includedItems: string[];
  requiredDocumentLabel: string;
  requiredDocumentFileName?: string;
  coverImageName?: string;
};

export const PARTNER_BUSINESS_TYPE_OPTIONS = [
  "Accommodation (Homestay / Lodge)",
  "Tourist Attraction",
  "Food & Beverage / Culinary",
  "Local Experience / Workshop",
  "Local Product / Souvenir - UMKM",
];

export const partnerBusinessProfileMock: PartnerBusinessProfile = {
  businessName: "Maju Rafting",
  ownerName: "Baskara",
  nik: "",
  businessType: "Tourist Attraction",
  email: "partner@manudjaya.com",
  nib: "",
  bankAccountName: "CV RAJA JAYA",
  phone: "021-2839246928",
  sku: "",
  bankAccountNumber: "769853627",
  businessAddress: "Desa Manud Jaya, RT 01 RW 01, No 12",
  siup: "",
  sustainabilityCertification: "",
  statusAccount: "Inactive",
  logoUrl: "",
};

export const partnerActivatedBusinessProfileMock: PartnerBusinessProfile = {
  businessName: "Maju Rafting",
  ownerName: "Bastian",
  nik: "3578123412341234",
  businessType: "Tourist Attraction",
  email: "bastian@manudjaya.com",
  nib: "9120304981234",
  bankAccountName: "CV RAJA JAYA",
  phone: "021-2839246928",
  sku: "SKU-778899",
  bankAccountNumber: "769853627",
  businessAddress: "Desa Manud Jaya, RT 01 RW 01, No 12",
  siup: "SIUP-998877",
  sustainabilityCertification: "Eco Partner Basic",
  statusAccount: "Activated",
  logoUrl: "logo-maju-rafting.png",
};

export const partnerDocumentsMock: PartnerDocumentItem[] = [
  {
    key: "ktp",
    label: "Document Owner Identification (KTP)",
    required: true,
    uploaded: false,
    verified: false,
  },
  {
    key: "nib",
    label: "Business Registration Certificate (NIB)",
    required: true,
    uploaded: false,
    verified: false,
  },
  {
    key: "sku",
    label: "Business Registration Certificate (SKU)",
    required: true,
    uploaded: false,
    verified: false,
  },
  {
    key: "siup",
    label: "Business Registration Certificate (SIUP)",
    required: true,
    uploaded: false,
    verified: false,
  },
  {
    key: "passbook",
    label: "Passbook Document",
    required: true,
    uploaded: false,
    verified: false,
  },
  {
    key: "sustainabilityCertification",
    label: "Sustainability Certification",
    required: false,
    uploaded: false,
    verified: false,
  },
];

export const partnerActivatedDocumentsMock: PartnerDocumentItem[] = [
  {
    key: "ktp",
    label: "Document Owner Identification (KTP)",
    required: true,
    uploaded: true,
    verified: true,
    fileName: "ktp-bastian.pdf",
  },
  {
    key: "nib",
    label: "Business Registration Certificate (NIB)",
    required: true,
    uploaded: true,
    verified: true,
    fileName: "nib-bastian.pdf",
  },
  {
    key: "sku",
    label: "Business Registration Certificate (SKU)",
    required: true,
    uploaded: true,
    verified: true,
    fileName: "sku-bastian.pdf",
  },
  {
    key: "siup",
    label: "Business Registration Certificate (SIUP)",
    required: true,
    uploaded: true,
    verified: true,
    fileName: "siup-bastian.pdf",
  },
  {
    key: "passbook",
    label: "Passbook Document",
    required: true,
    uploaded: true,
    verified: true,
    fileName: "rekening-bastian.pdf",
  },
  {
    key: "sustainabilityCertification",
    label: "Sustainability Certification",
    required: false,
    uploaded: true,
    verified: true,
    fileName: "eco-basic-bastian.pdf",
  },
];

export const partnerTourPackagesMock: PartnerTourPackage[] = [
  {
    id: "pkg-001",
    title: "A Day Adventure in Manud",
    category: "Eco",
    price: "Rp 325.000",
    duration: "1 Day (07.00 AM - 16.00 PM)",
    availability: "10",
    itineraryItems: [
      "07.00 – Sarapan pagi",
      "08.00 – Trekking ke Air Terjun Tirta Manud",
      "10.00 – River tubing di Sungai Lestari",
      "12.30 – Makan siang",
      "14.00 – Coffee tasting lokal",
      "16.00 – Selesai",
    ],
    includedItems: [
      "Local guide",
      "Breakfast & lunch",
      "Entrance tickets",
      "Conservation donation",
    ],
    requiredDocumentLabel: "Safety Certification",
    requiredDocumentFileName: "safety-certification.pdf",
    coverImageName: "package-adventure-manud.png",
  },
];

const requiredProfileKeys: (keyof PartnerBusinessProfile)[] = [
  "businessName",
  "ownerName",
  "nik",
  "businessType",
  "email",
  "nib",
  "bankAccountName",
  "phone",
  "sku",
  "bankAccountNumber",
  "businessAddress",
  "siup",
];

export function isBusinessProfileComplete(profile: PartnerBusinessProfile) {
  return requiredProfileKeys.every((key) => String(profile[key]).trim() !== "");
}

export function areRequiredDocumentsUploaded(documents: PartnerDocumentItem[]) {
  return documents.filter((doc) => doc.required).every((doc) => doc.uploaded);
}

export function getPartnerActivationProgress(
  profile: PartnerBusinessProfile,
  documents: PartnerDocumentItem[]
) {
  const profileFilledCount = requiredProfileKeys.filter(
    (key) => String(profile[key]).trim() !== ""
  ).length;

  const requiredDocs = documents.filter((doc) => doc.required);
  const uploadedDocsCount = requiredDocs.filter((doc) => doc.uploaded).length;

  const totalItems = requiredProfileKeys.length + requiredDocs.length;
  const completedItems = profileFilledCount + uploadedDocsCount;

  return Math.round((completedItems / totalItems) * 100);
}

export function isPartnerActivated(profile: PartnerBusinessProfile) {
  return profile.statusAccount === "Activated";
}