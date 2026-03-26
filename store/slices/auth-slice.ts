import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearAuthStorage, saveAuthToStorage } from "../utils/auth-storage";
import type { AuthState, LoginResponse, VendorProfileData } from "../types/auth";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginThunkResult = {
  token: string;
  loginUser: LoginResponse;
  vendorData: VendorProfileData;
};

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  loginUser: null,
  vendorData: null,
  loading: false,
  error: null,
  hydrated: false,
};

async function fetchLoginVendor(
  payload: LoginPayload
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const rawText = await response.text();

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error("Response /auth/login tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message || "Login gagal")
        : "Login gagal";

    throw new Error(message);
  }

  return data as LoginResponse;
}

async function fetchVendorProfile(token: string): Promise<VendorProfileData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const rawText = await response.text();

  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error("Response /vendor tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message || "Gagal mengambil data vendor")
        : "Gagal mengambil data vendor";

    throw new Error(message);
  }

  return data as VendorProfileData;
}

export const loginAndFetchVendor = createAsyncThunk<
  LoginThunkResult,
  LoginPayload,
  { rejectValue: string }
>("auth/loginAndFetchVendor", async (payload, thunkAPI) => {
  try {
    console.log("AUTH SLICE LOGIN PAYLOAD:", payload);

    const loginResult = await fetchLoginVendor(payload);

    console.log("AUTH SLICE LOGIN RESULT:", loginResult);

    const token = loginResult?.token;

    if (!token) {
      return thunkAPI.rejectWithValue("Token tidak ditemukan dari login");
    }

    const vendorData = await fetchVendorProfile(token);

    console.log("AUTH SLICE VENDOR RESULT:", vendorData);

    saveAuthToStorage({
      token,
      loginUser: loginResult,
      vendorData,
    });

    return {
      token,
      loginUser: loginResult,
      vendorData,
    };
  } catch (error) {
    console.error("AUTH SLICE LOGIN ERROR:", error);

    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Login gagal"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuthState: (
      state,
      action: PayloadAction<{
        token: string | null;
        loginUser: LoginResponse | null;
        vendorData: VendorProfileData | null;
      }>
    ) => {
      state.token = action.payload.token;
      state.loginUser = action.payload.loginUser;
      state.vendorData = action.payload.vendorData;
      state.isAuthenticated = !!action.payload.token;
      state.hydrated = true;
    },
    logout: (state) => {
      state.token = null;
      state.loginUser = null;
      state.vendorData = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.hydrated = true;

      clearAuthStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAndFetchVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAndFetchVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.loginUser = action.payload.loginUser;
        state.vendorData = action.payload.vendorData;
        state.isAuthenticated = true;
        state.hydrated = true;
      })
      .addCase(loginAndFetchVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login gagal";
        state.isAuthenticated = false;
        state.hydrated = true;
      });
  },
});

export const { hydrateAuthState, logout } = authSlice.actions;
export default authSlice.reducer;