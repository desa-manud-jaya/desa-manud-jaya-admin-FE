import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearAuthStorage, saveAuthToStorage } from "../utils/auth-storage";
import type {
  AuthState,
  LoginResponse,
  VendorProfileData,
} from "../types/auth";
import type { RootState } from "../index";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginThunkResult = {
  token: string;
  loginUser: LoginResponse;
  vendorData: VendorProfileData | null;
  sessionPassword: string;
};

const getBusinessIdFromVendorData = (
  vendorData: VendorProfileData | null
): string | null => {
  return vendorData?.vendorProfile?.businessId ?? null;
};

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  loginUser: null,
  vendorData: null,
  sessionPassword: null,
  loading: false,
  error: null,
  hydrated: false,
  businessId: null,
};

async function fetchLogin(payload: LoginPayload): Promise<LoginResponse> {
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor`,
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
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error("Response /vendor tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil data vendor"
          )
        : "Gagal mengambil data vendor";

    throw new Error(message);
  }

  return data as VendorProfileData;
}

export const refreshVendorProfile = createAsyncThunk<
  VendorProfileData,
  void,
  { state: RootState; rejectValue: string }
>("auth/refreshVendorProfile", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const token = state.auth.token;
    const loginUser = state.auth.loginUser;
    const sessionPassword = state.auth.sessionPassword;

    if (!token) {
      return thunkAPI.rejectWithValue("Token tidak ditemukan");
    }

    if (loginUser?.role !== "VENDOR") {
      return thunkAPI.rejectWithValue("Refresh profile hanya untuk vendor");
    }

    const vendorData = await fetchVendorProfile(token);

    saveAuthToStorage({
      token,
      loginUser,
      vendorData,
      sessionPassword,
    });

    console.log("REFRESH VENDOR PROFILE SUCCESS:", vendorData);

    return vendorData;
  } catch (error) {
    console.error("REFRESH VENDOR PROFILE ERROR:", error);

    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Gagal refresh vendor profile"
    );
  }
});

export const loginAndFetchUser = createAsyncThunk<
  LoginThunkResult,
  LoginPayload,
  { rejectValue: string }
>("auth/loginAndFetchUser", async (payload, thunkAPI) => {
  try {
    const loginResult = await fetchLogin(payload);
    const token = loginResult?.token;
    const role = loginResult?.role;

    if (!token) {
      return thunkAPI.rejectWithValue("Token tidak ditemukan dari login");
    }

    console.log("AUTH LOGIN RESPONSE:", loginResult);
    console.log("AUTH LOGIN ROLE:", role);

    let vendorData: VendorProfileData | null = null;

    if (role === "VENDOR") {
      vendorData = await fetchVendorProfile(token);
    }

    saveAuthToStorage({
      token,
      loginUser: loginResult,
      vendorData,
      sessionPassword: payload.password,
    });

    return {
      token,
      loginUser: loginResult,
      vendorData,
      sessionPassword: payload.password,
    };
  } catch (error) {
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
        sessionPassword: string | null;
      }>
    ) => {
      state.token = action.payload.token;
      state.loginUser = action.payload.loginUser;
      state.vendorData = action.payload.vendorData;
      state.sessionPassword = action.payload.sessionPassword;
      state.businessId = getBusinessIdFromVendorData(action.payload.vendorData);
      state.isAuthenticated = !!action.payload.token;
      state.hydrated = true;
    },
    logout: (state) => {
      state.token = null;
      state.loginUser = null;
      state.vendorData = null;
      state.sessionPassword = null;
      state.businessId = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.hydrated = true;

      clearAuthStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAndFetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAndFetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.loginUser = action.payload.loginUser;
        state.vendorData = action.payload.vendorData;
        state.sessionPassword = action.payload.sessionPassword;
        state.businessId = getBusinessIdFromVendorData(action.payload.vendorData);
        state.isAuthenticated = true;
        state.hydrated = true;
      })
      .addCase(loginAndFetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login gagal";
        state.isAuthenticated = false;
        state.businessId = null;
        state.hydrated = true;
      })
      .addCase(refreshVendorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshVendorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vendorData = action.payload;
        state.businessId = getBusinessIdFromVendorData(action.payload);
      })
      .addCase(refreshVendorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal refresh vendor profile";
      });
  },
});

export const { hydrateAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
