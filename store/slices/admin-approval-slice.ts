import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AdminApprovalState,
  PendingVendorApprovalItem,
} from "../types/admin-approval";
import type { RootState } from "../index";
import { logout } from "./auth-slice";

const initialState: AdminApprovalState = {
  pendingVendors: [],
  loadingPendingVendors: false,
  errorPendingVendors: null,
  approvingVendor: false,
  approveVendorError: null,
  rejectingVendor: false,
  rejectVendorError: null,
};

async function fetchPendingVendorApprovals(
  token: string
): Promise<PendingVendorApprovalItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vendors/pending`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : [];
  } catch {
    throw new Error("Response /admin/vendors/pending tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil list approval vendor"
          )
        : "Gagal mengambil list approval vendor";

    throw new Error(message);
  }

  return Array.isArray(data) ? (data as PendingVendorApprovalItem[]) : [];
}

async function approveVendorRequest(token: string, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vendors/${userId}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message || "Gagal approve vendor"
          )
        : "Gagal approve vendor";

    throw new Error(message);
  }

  return data;
}

async function rejectVendorRequest(token: string, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vendors/${userId}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message || "Gagal reject vendor"
          )
        : "Gagal reject vendor";

    throw new Error(message);
  }

  return data;
}

export const getPendingVendorApprovals = createAsyncThunk<
  PendingVendorApprovalItem[],
  void,
  { state: RootState; rejectValue: string }
>("adminApproval/getPendingVendorApprovals", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;

    if (!token) {
      return thunkAPI.rejectWithValue("Token admin tidak ditemukan");
    }

    const result = await fetchPendingVendorApprovals(token);

    console.log("PENDING VENDOR APPROVALS RESULT:", result);

    return result;
  } catch (error) {
    console.error("PENDING VENDOR APPROVALS ERROR:", error);

    return thunkAPI.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Gagal mengambil list approval vendor"
    );
  }
});

export const approvePendingVendor = createAsyncThunk<
  { userId: string; response: unknown },
  { userId: string },
  { state: RootState; rejectValue: string }
>("adminApproval/approvePendingVendor", async ({ userId }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;

    if (!token) {
      return thunkAPI.rejectWithValue("Token admin tidak ditemukan");
    }

    const response = await approveVendorRequest(token, userId);

    console.log("APPROVE VENDOR SUCCESS:", { userId, response });

    return {
      userId,
      response,
    };
  } catch (error) {
    console.error("APPROVE VENDOR ERROR:", error);

    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Gagal approve vendor"
    );
  }
});

export const rejectPendingVendor = createAsyncThunk<
  { userId: string; response: unknown },
  { userId: string },
  { state: RootState; rejectValue: string }
>("adminApproval/rejectPendingVendor", async ({ userId }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;

    if (!token) {
      return thunkAPI.rejectWithValue("Token admin tidak ditemukan");
    }

    const response = await rejectVendorRequest(token, userId);

    console.log("REJECT VENDOR SUCCESS:", { userId, response });

    return {
      userId,
      response,
    };
  } catch (error) {
    console.error("REJECT VENDOR ERROR:", error);

    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Gagal reject vendor"
    );
  }
});

const adminApprovalSlice = createSlice({
  name: "adminApproval",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPendingVendorApprovals.pending, (state) => {
        state.loadingPendingVendors = true;
        state.errorPendingVendors = null;
      })
      .addCase(getPendingVendorApprovals.fulfilled, (state, action) => {
        state.loadingPendingVendors = false;
        state.pendingVendors = action.payload;
        state.errorPendingVendors = null;
      })
      .addCase(getPendingVendorApprovals.rejected, (state, action) => {
        state.loadingPendingVendors = false;
        state.errorPendingVendors =
          action.payload || "Gagal mengambil list approval vendor";
      })
      .addCase(approvePendingVendor.pending, (state) => {
        state.approvingVendor = true;
        state.approveVendorError = null;
      })
      .addCase(approvePendingVendor.fulfilled, (state, action) => {
        state.approvingVendor = false;
        state.approveVendorError = null;
        state.pendingVendors = state.pendingVendors.filter(
          (item) => item.userId !== action.payload.userId
        );
      })
      .addCase(approvePendingVendor.rejected, (state, action) => {
        state.approvingVendor = false;
        state.approveVendorError =
          action.payload || "Gagal approve vendor";
      })
      .addCase(rejectPendingVendor.pending, (state) => {
        state.rejectingVendor = true;
        state.rejectVendorError = null;
      })
      .addCase(rejectPendingVendor.fulfilled, (state, action) => {
        state.rejectingVendor = false;
        state.rejectVendorError = null;
        state.pendingVendors = state.pendingVendors.filter(
          (item) => item.userId !== action.payload.userId
        );
      })
      .addCase(rejectPendingVendor.rejected, (state, action) => {
        state.rejectingVendor = false;
        state.rejectVendorError =
          action.payload || "Gagal reject vendor";
      })
      .addCase(logout, () => {
        return initialState;
      });
  },
});

export default adminApprovalSlice.reducer;