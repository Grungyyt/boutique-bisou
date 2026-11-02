import { NextRequest, NextResponse } from "next/server";
import {
  appUrl,
  cookieOpts,
  exchangeCode,
  fetchUser,
  safeEqual,
  seal,
  Session,
  SESSION_COOKIE,
  STATE_COOKIE,
} from "@/lib/vth";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state") ?? "";
  const code = req.nextUrl.searchParams.get("secretCode") ?? "";
  const expected = req.cookies.get(STATE_COOKIE)?.value ?? "";

  const fail = (reason: "state" | "auth" | "access") => {
    const res = NextResponse.redirect(`${appUrl()}/?error=${reason}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  // 1. Vérifie le state (usage unique : le cookie est supprimé dans tous les cas)
  if (!state || !code || !expected || !safeEqual(state, expected)) {
    return fail("state");
  }

  // 2. Échange le code contre les tokens (serveur uniquement)
  const tokens = await exchangeCode(code);
  if (!tokens) return fail("auth");

  // 3. Récupère l'utilisateur et ses permissions
  const u = await fetchUser(tokens.access_token);
  if (u.status === 403) return fail("access");
  if (!u.user) return fail("auth");

  // 4. Crée la session chiffrée
  const session: Session = {
    at: tokens.access_token,
    rt: tokens.refresh_token,
    exp: Date.now() + (tokens.expires_in - 60) * 1000,
    user: u.user,
  };

  const res = NextResponse.redirect(`${appUrl()}/dashboard`);
  res.cookies.delete(STATE_COOKIE);
  res.cookies.set(SESSION_COOKIE, seal(session), cookieOpts(60 * 60 * 24 * 30));
  return res;
}
