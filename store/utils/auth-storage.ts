import type { LoginResponse, VendorProfileData } from "../types/auth";

const TOKEN_KEY = "admin_auth_token";
const LOGIN_USER_KEY = "admin_auth_login_user";
const VENDOR_DATA_KEY = "admin_auth_vendor_data";
const SESSION_PASSWORD_KEY = "admin_auth_session_password";

export function saveAuthToStorage(params: {
  token: string;
  loginUser: LoginResponse | null;
  vendorData: VendorProfileData | null;
  sessionPassword: string | null;
}) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, params.token);

  if (params.loginUser) {
    localStorage.setItem(LOGIN_USER_KEY, JSON.stringify(params.loginUser));
  } else {
    localStorage.removeItem(LOGIN_USER_KEY);
  }

  if (params.vendorData) {
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(params.vendorData));
  } else {
    localStorage.removeItem(VENDOR_DATA_KEY);
  }

  if (params.sessionPassword) {
    localStorage.setItem(SESSION_PASSWORD_KEY, params.sessionPassword);
  } else {
    localStorage.removeItem(SESSION_PASSWORD_KEY);
  }
}

export function loadAuthFromStorage() {
  if (typeof window === "undefined") {
    return {
      token: null,
      loginUser: null,
      vendorData: null,
      sessionPassword: null,
    };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const loginUserRaw = localStorage.getItem(LOGIN_USER_KEY);
  const vendorDataRaw = localStorage.getItem(VENDOR_DATA_KEY);
  const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);

  return {
    token,
    loginUser: loginUserRaw ? JSON.parse(loginUserRaw) : null,
    vendorData: vendorDataRaw ? JSON.parse(vendorDataRaw) : null,
    sessionPassword,
  };
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_USER_KEY);
  localStorage.removeItem(VENDOR_DATA_KEY);
  localStorage.removeItem(SESSION_PASSWORD_KEY);
}