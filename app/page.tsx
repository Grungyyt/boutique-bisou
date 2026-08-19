import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [viewParams, setViewParams] = useState({});
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fonction de navigation centralisée
  const navigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Vérification de l'URL pour un accès direct avec un token
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      navigate("reservation", { token });
    }

    // Vérifie si l'utilisateur est connecté au chargement
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Non connecté");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    navigate("home");
  };

  if (loadingUser) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500">Chargement...</div>;
  }

  const renderView = () => {
    switch (currentView) {
      case "login":
        return <Login navigate={navigate} setUser={setUser} />;
      case "register":
        return <Register navigate={navigate} />;
      case "dashboard":
        return <AdminDashboard navigate={navigate} user={user} />;
      case "boutique":
        return <Boutique navigate={navigate} user={user} />;
      case "reservation":
        return <ReservationConfirmation navigate={navigate} token={viewParams.token} />;
      case "home":
      default:
        return <Home navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-pink-200 dark:selection:bg-pink-900">
      {/* On n'affiche pas la NavBar sur la page d'accueil pour garder l'effet landing page */}
      {currentView !== "home" && (
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="font-black text-xl tracking-tight text-pink-600 flex items-center gap-2 cursor-pointer transition hover:opacity-80" onClick={() => navigate("home")}>
            Boutique Bisou
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            {user ? (
              <>
                <span className="text-zinc-500 hidden sm:inline-block">Bonjour, {user.prenom}</span>
                {user.is_admin && (
                  <button onClick={() => navigate("dashboard")} className="text-pink-600 hover:underline hidden sm:inline-block">
                    Dashboard
                  </button>
                )}
                <button onClick={handleLogout} className="rounded-lg bg-zinc-100 px-4 py-2 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("login")} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Connexion</button>
                <button onClick={() => navigate("register")} className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 shadow-sm transition">Inscription</button>
              </>
            )}
          </div>
        </nav>
      )}
      {renderView()}
    </div>
  );
}

// Les 5 photos, hébergées sur le storage.
const IMAGES = [
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
];

const TAGS = [
  ["BOUTIQUE BISOU", "Ouverture 2025 2026"],
  ["BOUTIQUE BISOU", "Dans la boutique"],
  ["BOUTIQUE BISOU", "Décoration"],
  ["BOUTIQUE BISOU", "Discussions pendant l'ouverture"],
  ["BOUTIQUE BISOU", "Ouverture avec Les Medias"],
];

const ROT_JITTER = [0, -6, 5, -4, 7];
const SWIPE_MS = 550;
const SETTLE_MS = 480;
const FRONT_HOLD_MS = 2400; 
const HOLD_PAUSE = SWIPE_MS + SETTLE_MS + FRONT_HOLD_MS;

function Home({ navigate, user }) {
  const [order, setOrder] = useState(IMAGES.map((_, i) => i));
  const [swipingId, setSwipingId] = useState(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runCycle = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (paused) {
        runCycle();
        return;
      }
      setOrder((prev) => {
        setSwipingId(prev[0]);
        return prev;
      });

      setTimeout(() => {
        setOrder((prev) => [...prev.slice(1), prev[0]]);
        setSwipingId(null);
      }, SWIPE_MS);

      runCycle();
    }, HOLD_PAUSE);
  }, [paused]);

  useEffect(() => {
    runCycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runCycle]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatusType("success");
        setStatusMessage(data.message || "Inscription réussie !");
        setEmail("");
      } else {
        setStatusType("error");
        setStatusMessage(data.detail || "Une erreur est survenue.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center relative">
      <div className="fixed bottom-8 left-4 z-50 hidden lg:block">
        <img src="https://storage.vth-mc.fr/img/web/marche.gif" alt="Support" className="h-32 w-auto object-contain" />
      </div>

      {user && (
         <div className="absolute top-6 right-8 z-50">
           <button onClick={() => navigate("boutique")} className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
             Connecté en tant que {user.prenom}
           </button>
         </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-16">
        <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:gap-20">
          <div className="max-w-md text-center lg:text-left">
            <div className="mb-8 flex justify-center lg:justify-start">
              <img src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png" alt="Logo Boutique Bisou" className="h-32 w-auto object-contain" />
            </div>

            <span className="mb-4 inline-block rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Boutique Bisou
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              Des vêtements choisis avec cœur
            </h1>
            <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
              Chaque pièce a sa propre histoire. Échangez vos tickets contre des vêtements uniques, sélectionnés un à un.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button onClick={() => navigate("boutique")} className="inline-block rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95">
                Voir les articles
              </button>
              <button onClick={() => alert("La page équipe arrive bientôt !")} className="inline-block rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95">
                Voir l'Équipe
              </button>
              <button onClick={() => navigate("dashboard")} className="inline-block rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95">
                Tableau de bord
              </button>
              <a href="https://ko-fi.com/vth" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95">
                <img src="https://storage.vth-mc.fr/img/web/marche.gif" alt="" className="h-5 w-auto" />
                Soutenir
              </a>
            </div>
          </div>

          <div className="relative h-[520px] w-[340px] shrink-0 sm:h-[580px] sm:w-[380px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {order.map((imgIndex, pos) => {
              const isFront = pos === 0;
              const isSwiping = swipingId === imgIndex;
              const depth = isSwiping ? 0 : pos;
              const baseRotate = ROT_JITTER[imgIndex];
              const stackRotate = depth === 0 ? 0 : baseRotate * (0.55 + depth * 0.18);
              const translateY = depth * 14;
              const scale = 1 - depth * 0.055;
              const transform = isSwiping ? `translate(135%, -10%) rotate(${28 + baseRotate}deg) scale(0.92)` : `translateY(${translateY}px) rotate(${stackRotate}deg) scale(${scale})`;

              return (
                <div key={imgIndex} className="absolute inset-0" style={{ zIndex: 50 - pos, transform, opacity: isSwiping ? 0 : 1, transition: isSwiping ? `transform ${SWIPE_MS}ms cubic-bezier(.45,0,.55,1), opacity ${SWIPE_MS}ms ease-out` : `transform ${SETTLE_MS}ms cubic-bezier(.22,1,.36,1), opacity 250ms ease-out`, willChange: "transform, opacity" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                    <img src={IMAGES[imgIndex]} alt={`Vêtement ${imgIndex + 1}`} className="h-full w-full object-cover" draggable={false} />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                    {isFront && (
                      <div className="absolute left-3 top-3 flex h-5 w-9 items-center rounded-full bg-white/25 px-0.5 backdrop-blur-sm">
                        <span className="h-4 w-4 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                      </div>
                    )}
                    {isFront && (
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                        {TAGS[imgIndex].map((tag) => (
                          <span key={tag} className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">{tag}</span>
                        ))}
                      </div>
                    )}
                    {isFront && !isSwiping && (
                      <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5">
              {IMAGES.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${order[0] === i ? "w-5 bg-pink-500" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 w-full max-w-xl rounded-3xl border border-pink-100 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950/50"><span className="text-2xl">💌</span></div>
          <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Alerte nouveaux vêtements</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Soyez le premier informé dès qu’un nouvel article est ajouté à la boutique. Recevez la photo et les détails directement par e-mail.</p>
          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre.email@exemple.com" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            <button type="submit" disabled={isSubmitting} className="w-full shrink-0 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50 sm:w-auto">
              {isSubmitting ? "Inscription..." : "M'inscrire"}
            </button>
          </form>
          {statusMessage && (
            <p className={`mt-4 text-xs font-semibold ${statusType === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {statusType === "success" ? "✨ " : "⚠️ "}{statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Boutique({ navigate, user }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [reservingId, setReservingId] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits`);
        if (!res.ok) {
          setError("Impossible de charger les articles.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProduits(data.produits || []);
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  const resultats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return produits;
    return produits.filter((p) =>
      [p.nom, p.couleur, p.type, p.genre, p.taille]
        .filter(Boolean)
        .some((champ) => champ.toLowerCase().includes(q))
    );
  }, [produits, search]);

  const handleReserve = async (produitId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Vous devez être connecté pour réserver un article.");
      navigate("login");
      return;
    }

    if (reservingId) return;
    setReservingId(produitId);

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produit_id: produitId }),
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok && data.token) {
        navigate("reservation", { token: data.token });
      } else {
        alert(data.detail || "Erreur lors de la réservation.");
        setReservingId(null);
      }
    } catch {
      alert("Impossible de contacter le serveur pour effectuer la réservation.");
      setReservingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <button onClick={() => navigate("home")} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            ← Retour à l'accueil
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">La boutique</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Tous les articles disponibles, réservables en 1 clic</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher (nom, couleur, type, genre, taille...)" className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          </div>
          {!loading && (
            <p className="mt-2 text-xs text-zinc-400">
              {resultats.length} article{resultats.length > 1 ? "s" : ""}
              {search.trim() ? ` pour « ${search.trim()} »` : ""}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
            ))}
          </div>
        ) : resultats.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            {search.trim() ? "Aucun article ne correspond à ta recherche." : "Aucun article pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {resultats.map((p) => (
              <div key={p.id} className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 ${p.quantite === 0 ? "opacity-60" : ""}`}>
                <div className="block flex-1">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.nom} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">Pas de photo</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-pink-600 transition">{p.nom}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{p.type} {p.genre && `· ${p.genre}`} · {p.taille}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">{p.prix_tickets} 🎟️</span>
                      {p.quantite === 0 ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">Rupture</span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">{p.quantite} en stock</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <button type="button" disabled={p.quantite <= 0 || reservingId === p.id} onClick={(e) => handleReserve(p.id, e)} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2 text-xs font-bold text-white shadow transition hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    {reservingId === p.id ? "Réservation..." : p.quantite <= 0 ? "Indisponible" : "Réserver ce vêtement 📌"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationConfirmation({ navigate, token }) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de réservation introuvable.");
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      try {
        const res = await fetch(`${API_URL}/reservations/lookup?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error("Réservation introuvable ou expirée.");
        const data = await res.json();
        setReservation(data);
      } catch (err) {
        setError(err.message || "Impossible de récupérer les détails.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [token]);

  const handleCopyCode = () => {
    if (reservation?.code_6_chiffres) {
      navigator.clipboard.writeText(reservation.code_6_chiffres);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-[85vh] bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        <div className="mb-4 flex justify-center">
          <img src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png" alt="Boutique Bisou" className="h-16 w-auto object-contain" />
        </div>

        {loading ? (
          <div className="py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
            <p className="mt-4 text-xs font-medium text-zinc-400">Chargement de votre réservation...</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 text-xl">⚠️</div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Réservation introuvable</h2>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
            <button onClick={() => navigate("boutique")} className="mt-6 inline-block rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-pink-600">
              Retour à la boutique
            </button>
          </div>
        ) : reservation ? (
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span>✨</span><span>Vêtement réservé avec succès !</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Conservez votre numéro</h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Présentez ce numéro lors de votre passage en boutique.</p>

            <div className="my-6 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-lg">
              <div className="rounded-[15px] bg-white dark:bg-zinc-950 p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Numéro de Réservation</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-wider text-pink-600 dark:text-pink-400 font-mono">
                    {reservation.code_6_chiffres}
                  </span>
                </div>
                <button type="button" onClick={handleCopyCode} className="mt-3 text-xs font-medium text-pink-600 dark:text-pink-400 hover:underline inline-flex items-center gap-1">
                  {copied ? "✓ Copié !" : "📋 Copier le numéro"}
                </button>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-200 dark:border-amber-800/50 text-left">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5"><span>📍</span> À présenter à la Boutique Bisou</p>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">Montrez ce numéro à l'équipe pour récupérer votre article et donner vos {reservation.prix_tickets} ticket(s).</p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-3.5 text-left">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                {reservation.produit_photo ? (
                  <img src={reservation.produit_photo} alt={reservation.produit_nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">Sans photo</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{reservation.produit_nom}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{reservation.produit_type} · {reservation.produit_taille} · {reservation.produit_couleur}</p>
                <p className="mt-1 text-xs font-bold text-pink-600 dark:text-pink-400">{reservation.prix_tickets} ticket(s) 🎟️</p>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={() => navigate("boutique")} className="text-xs font-semibold text-zinc-500 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-400 transition">
                ← Continuer à visiter la boutique
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Login({ navigate, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur de connexion");
      setUser(data.user);
      navigate("boutique");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Adresse Email" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 hover:opacity-90 transition shadow-sm">Se connecter</button>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">Pas encore de compte ? <button type="button" onClick={() => navigate("register")} className="text-pink-600 font-semibold hover:underline">S'inscrire</button></p>
      </form>
    </div>
  );
}

function Register({ navigate }) {
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur d'inscription");
      alert("Compte créé avec succès ! Connectez-vous.");
      navigate("login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
        <p className="text-xs text-zinc-500 mb-6 text-center">Un seul compte autorisé par personne.</p>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}
        <div className="space-y-4">
          <div className="flex gap-4">
            <input type="text" placeholder="Prénom" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            <input type="text" placeholder="Nom" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none uppercase" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
          </div>
          <input type="email" placeholder="Adresse Email" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Mot de passe" required className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm focus:border-pink-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="w-full rounded-xl bg-pink-600 text-white font-bold py-3 hover:bg-pink-700 transition shadow-sm">M'inscrire</button>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard({ user, navigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("home");
      return;
    }

    fetch(`${API_URL}/admin/reservations`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Accès refusé ou erreur de chargement.");
        return res.json();
      })
      .then(data => setReservations(data.reservations || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user?.is_admin) return null;

  const filtered = reservations.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.code_6_chiffres && r.code_6_chiffres.includes(q)) ||
      (r.produit_nom && r.produit_nom.toLowerCase().includes(q)) ||
      (r.user_nom && r.user_nom.toLowerCase().includes(q)) ||
      (r.user_prenom && r.user_prenom.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">🔒 Dashboard Admin</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Associez les vêtements avec les clients</p>
        </div>
        <div className="relative w-full max-w-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, code, article..." className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 shadow-sm" />
        </div>
      </div>

      {error && <p className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-zinc-400 text-sm font-medium">Chargement des données...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">Aucune réservation trouvée.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition hover:shadow-md">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {r.produit_photo ? (
                    <img src={r.produit_photo} alt={r.produit_nom} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400 text-center p-1">Pas de photo</div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{r.user_prenom} <span className="uppercase">{r.user_nom}</span></h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{r.produit_nom}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{r.produit_type} · {r.produit_taille} · {r.produit_couleur}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800">
                <div className="text-left md:text-right">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Code Présenté</p>
                  <span className="text-2xl font-black font-mono tracking-widest text-pink-600 dark:text-pink-400">#{r.code_6_chiffres}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {r.status || "Réservé"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">{new Date(r.created_at).toLocaleString("fr-FR", {day: "2-digit", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
