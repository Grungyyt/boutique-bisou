"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

export default function DashboardPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAndFetch() {
      try {
        // 1. Appel de vérification de session (similaire à un /auth/me)
        // On utilise la même méthode que votre page "Caisse" qui fonctionne
        const authRes = await fetch(`${API_URL}/produits`, { 
          credentials: "include" 
        });

        if (authRes.status === 401) {
          window.location.href = LOGIN_URL;
          return;
        }

        // 2. Si on est authentifié, on récupère les réservations
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;

        if (!user) {
          window.location.href = LOGIN_URL;
          return;
        }

        const res = await fetch(`${API_URL}/admin/reservations?user_id=${user.id}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setReservations(data.reservations || []);
        }
      } catch (err) {
        console.error("Erreur de connexion :", err);
      } finally {
        setLoading(false);
      }
    }

    verifyAndFetch();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des réservations</h1>
      {/* Votre tableau ici */}
      <pre>{JSON.stringify(reservations, null, 2)}</pre>
    </div>
  );
}
