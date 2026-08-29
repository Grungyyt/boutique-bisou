"use client";

export default function EtaVerifPage() {
  // Cette page affiche juste le message de maintenance
  // À implémenter côté serveur : vérifier la base de données et rediriger si operational = true

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 px-6">
      <div className="text-center max-w-md">
        {/* Icône d'erreur */}
        <div className="mb-6 text-6xl">
          🔧
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
          Service en maintenance
        </h1>

        {/* Description */}
        <p className="text-lg text-rose-800 dark:text-rose-200 mb-8">
          Nous effectuons actuellement une maintenance préventive. Le service sera bientôt de retour.
        </p>

        {/* Message informatif */}
        <div className="bg-white dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 p-4 mb-6">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Veuillez réessayer dans quelques instants.
          </p>
        </div>

        {/* Bouton de réessai */}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition active:scale-95"
        >
          Réessayer
        </button>

        {/* Email de support */}
        <p className="mt-6 text-xs text-rose-600 dark:text-rose-400">
          Pour toute question :<br />
          <a
            href="mailto:support@boutique-bisou.fr"
            className="underline hover:text-rose-700"
          >
            support@boutique-bisou.fr
          </a>
        </p>
      </div>
    </div>
  );
}
