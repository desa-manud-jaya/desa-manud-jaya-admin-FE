export type PendingVendorApprovalItem = {
  userId: string;
  username: string;
  email: string;
  vendorName: string;
  phone: string;
  address: string;
  ktpNumber: string;
};

export type AdminApprovalState = {
  pendingVendors: PendingVendorApprovalItem[];
  loadingPendingVendors: boolean;
  errorPendingVendors: string | null;
  approvingVendor: boolean;
  approveVendorError: string | null;
  rejectingVendor: boolean;
  rejectVendorError: string | null;
};