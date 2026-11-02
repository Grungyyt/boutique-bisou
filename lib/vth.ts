import crypto from "crypto";

export const AUTH_BASE = "https://auth.vth-mc.fr";
export const SESSION_COOKIE = "bisou_session";
export const STATE_COOKIE = "bisou_state";

const appUrl = () => process.env.APP_URL ?? "";
const publicId = () => process.env.VTH_PUBLIC_ID ?? "";
const apiKey = () => process.env.VTH_API_KEY ?? "";

export type VthUser = {
  userid: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type Session = {
  at: string;
  rt: string;
  exp: number; // timestamp ms d'expiration de l'access token
  user: VthUser;
};

export { appUrl };

export function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

// ---------- State (CSRF) ----------

export function newState(): string {
  // randomBytes(24) → base64url de 32 caractères (lettres, chiffres, - et _)
  return crypto.randomBytes(24).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// ---------- Chiffrement du cookie de session (AES-256-GCM) ----------

function sessionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant");
  return crypto.createHash("sha256").update(secret).digest();
}

export function seal(data: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", sessionKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function unseal<T>(value: string): T | null {
  try {
    const buf = Buffer.from(value, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", sessionKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return null;
  }
}

// ---------- Appels API VTH (serveur uniquement) ----------

async function vthPost(path: string, body: object, bearer: string = apiKey()) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export function authorizeUrl(state: string): string {
  const url = new URL(`${AUTH_BASE}/authorize`);
  url.searchParams.set("public_token", publicId());
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCode(code: string): Promise<Tokens | null> {
  const r = await vthPost("/api/serviceWithCode", { code });
  return r.status === 200 && r.data?.ok ? (r.data as Tokens) : null;
}

export async function fetchUser(accessToken: string): Promise<{ status: number; user?: VthUser }> {
  const r = await vthPost("/api/service/user", { service_token: accessToken });
  return { status: r.status, user: r.data?.user };
}

export async function refreshTokens(refreshToken: string): Promise<{ status: number; tokens?: Tokens }> {
  const r = await vthPost("/api/service/refresh", { refresh_token: refreshToken });
  return {
    status: r.status,
    tokens: r.status === 200 && r.data?.ok ? (r.data as Tokens) : undefined,
  };
}
