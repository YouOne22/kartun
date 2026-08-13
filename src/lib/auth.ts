import { cookies } from "next/headers";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { Role, User } from "@prisma/client";

export const SESSION_COOKIE = "tunas_harapan_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionClaims = JWTPayload & {
  userId: string;
  role: Role;
  isDefaultPassword: boolean;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET harus diatur dan memiliki minimal 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: Pick<User, "id" | "role" | "isDefaultPassword">) {
  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    isDefaultPassword: user.isDefaultPassword,
  } satisfies Omit<SessionClaims, keyof JWTPayload>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());

  return token;
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<SessionClaims>(token, getAuthSecret());
    if (!payload.userId || !payload.role || typeof payload.isDefaultPassword !== "boolean") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}

export function hasRole(role: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(role);
}
