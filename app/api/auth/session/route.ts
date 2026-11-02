import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  cookieOpts,
  fetchUser,
  refreshTokens,
  seal,
  Session,
  SESSION_COOKIE,
  unseal,
} from "@/lib/vth";

// Renvoie l'utilisateur courant et rafraîchit la session si l'access token a expiré.
export async function GET() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = raw ? unseal<Session>(raw) : null;

  const clear = (status: number) => {
    const res = NextResponse.json({ error: "unauthorized" }, { status });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  };

  if (!session) return clear(401);

  // Access token encore valide
  if (session.exp > Date.now()) {
    return NextResponse.json({ user: session.user });
  }

  // Rotation du refresh token (l'ancien est invalidé côté VTH)
  const r = await refreshTokens(session.rt);
  if (r.status === 409) {
    // Une requête concurrente a déjà rotaté la paire : le client doit réessayer
    return NextResponse.json({ error: "retry" }, { status: 409 });
  }
  if (!r.tokens) return clear(401);

  // Relit l'utilisateur (rôle admin à jour, et détection d'accès retiré)
  const u = await fetchUser(r.tokens.access_token);
  if (u.status === 403) return clear(403);
  if (!u.user) return clear(401);

  const next: Session = {
    at: r.tokens.access_token,
    rt: r.tokens.refresh_token,
    exp: Date.now() + (r.tokens.expires_in - 60) * 1000,
    user: u.user,
  };

  const res = NextResponse.json({ user: u.user });
  res.cookies.set(SESSION_COOKIE, seal(next), cookieOpts(60 * 60 * 24 * 30));
  return res;
}
