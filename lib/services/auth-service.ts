export type JenisUsahaApi =
  | "AKOMODASI"
  | "TOURIST_ATTRACTION"
  | "CULINARY"
  | "WORKSHOP"
  | "SOUVENIR";

export type UpdateVendorPayload = {
  namaUsaha: string;
  namaOwner: string;
  bankAccountName: string;
  bankAccountNumber: string;
  jenisUsaha: JenisUsahaApi;
  email: string;
  phone: string;
  address: string;
  nik: string;
  nib: string;
  sku: string;
  siup: string;
};

export function mapBusinessTypeToApi(value: string): JenisUsahaApi {
  switch (value) {
    case "Accommodation (Homestay / Lodge)":
      return "AKOMODASI";
    case "Tourist Attraction":
      return "TOURIST_ATTRACTION";
    case "Food & Beverage / Culinary":
      return "CULINARY";
    case "Local Experience / Workshop":
      return "WORKSHOP";
    case "Local Product / Souvenir - UMKM":
      return "SOUVENIR";
    default:
      return "AKOMODASI";
  }
}

export async function updateVendorProfile(
  token: string,
  payload: UpdateVendorPayload
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const rawText = await response.text();

  let data: any = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { message: rawText };
  }

  if (!response.ok) {
    throw new Error(data?.message || "Gagal update vendor profile");
  }

  return data;
}