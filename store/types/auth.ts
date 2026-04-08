export type LoginResponse = {
  id: string;
  username: string;
  token: string;
  role: string;
};

export type VendorProfileData = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  status: string;
  vendorProfile: {
    vendorName: string;
    ownerName: string;
    jenisUsaha: string;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    sustainabilityCertification: string | null;
    nik: string | null;
    nib: string | null;
    sku: string | null;
    siup: string | null;
    description: string;
    phone: string;
    ktpNumber: string;
    address: string;
    approvalStatus: string;
    approvedAt: string | null;
    businessId: string | null;
  };
  createdAt: string;
  updatedAt: string | null;
};

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  loginUser: LoginResponse | null;
  vendorData: VendorProfileData | null;
  sessionPassword: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  businessId: string | null;
};