export const AUTH_COOKIE_NAME = "dmj_portal_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 8;

export type UserRole = "admin" | "partner";
export type PartnerAccountStatus =
  | "Inactive"
  | "Pending Review"
  | "Activated"
  | "Rejected";

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus?: PartnerAccountStatus;
};

export type LoginPayload = {
  email: string;
  password: string;
  role: UserRole;
};

type DummyUser = AuthSession & {
  password: string;
};

const DUMMY_USERS: DummyUser[] = [
  {
    id: "1",
    name: "Roy",
    email: "admin@manudjaya.com",
    password: "Admin123!",
    role: "admin",
  },
  {
    id: "2",
    name: "Baskara",
    email: "partner@manudjaya.com",
    password: "Partner123!",
    role: "partner",
    accountStatus: "Inactive",
  },
  {
    id: "3",
    name: "Bastian",
    email: "bastian@manudjaya.com",
    password: "Bastian123!",
    role: "partner",
    accountStatus: "Activated",
  },
];

export function loginWithDummy(payload: LoginPayload): AuthSession | null {
  const user = DUMMY_USERS.find(
    (item) =>
      item.role === payload.role &&
      item.email.toLowerCase() === payload.email.trim().toLowerCase() &&
      item.password === payload.password
  );

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
  };
}

export function encodeSession(session: AuthSession): string {
  const json = JSON.stringify(session);

  if (typeof window !== "undefined") {
    return window.btoa(json);
  }

  return Buffer.from(json, "utf8").toString("base64");
}

export function decodeSession(value?: string | null): AuthSession | null {
  if (!value) return null;

  try {
    const decoded =
      typeof window !== "undefined"
        ? window.atob(value)
        : Buffer.from(value, "base64").toString("utf8");

    const parsed = JSON.parse(decoded);

    const validStatus =
      parsed.accountStatus === undefined ||
      parsed.accountStatus === "Inactive" ||
      parsed.accountStatus === "Pending Review" ||
      parsed.accountStatus === "Activated" ||
      parsed.accountStatus === "Rejected";

    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      (parsed.role === "admin" || parsed.role === "partner") &&
      validStatus
    ) {
      return parsed as AuthSession;
    }

    return null;
  } catch {
    return null;
  }
}

export function setAuthSessionCookie(session: AuthSession) {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(encodeSession(session));
  document.cookie = `${AUTH_COOKIE_NAME}=${encoded}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearAuthSessionCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthSessionFromBrowser(): AuthSession | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!cookie) return null;

  const rawValue = cookie.split("=")[1];
  return decodeSession(decodeURIComponent(rawValue));
}