import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informations Légales — Boutique Bisou",
  description: "Consultez les mentions légales, CGU et CGV de la Boutique Bisou.",
};

export default function LegalIndexPage() {
  const legalSections = [
    {
      title: "Mentions Légales",
      description: "Informations sur l'éditeur du site, l'hébergeur et les crédits.",
      href: "/legal/mentions-legal",
      badge: "Éditeur & Hébergement",
    },
    {
      title: "Conditions Générales d'Utilisation",
      description: "Règles d'utilisation du site, propriété intellectuelle et gestion des données.",
      href: "/legal/cgu",
      badge: "CGU",
    },
    {
      title: "Conditions Générales de Vente",
      description: "Conditions d'achat, tarifs, modalités de paiement et de rétractation.",
      href: "/legal/cgv",
      badge: "CGV",
    },
  ];

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
          Centre de confidentialité
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
          Informations Légales
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Retrouve ici l'ensemble des documents juridiques régissant l'utilisation de la Boutique Bisou.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {legalSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
          >
            <div>
              <span className="inline-block rounded-lg bg-pink-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-pink-500">
                {section.badge}
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-pink-500 transition-colors">
                {section.title}
              </h2>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {section.description}
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-medium text-pink-500">
              Consulter
              <svg
                className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
