import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OsaStatusBadge from "./OsaStatusBadge";
import VisitTracker from "./VisitTracker";

// Variable CLIENT corrigée
const CLIENT = "Collège Pierre Dubois";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boutique Bisou",
  description: "Created By VTH Group",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-pink-500/20 selection:text-pink-600 dark:bg-black dark:text-zinc-100">
        
        {/* Halo de lumière d'arrière-plan */}
        <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-amber-400/10 blur-[100px]" />

        <VisitTracker />
        
        <main className="relative z-10 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full py-6 flex flex-col items-center gap-4 bg-white/60 border-t border-zinc-200/80 backdrop-blur-md px-4 dark:bg-zinc-950/60 dark:border-zinc-800/80">
          
          {/* Bouton Principal (Soutenir avec le dégradé d'origine) */}
          <a
            href="https://ko-fi.com/vth"
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative overflow-hidden px-4 py-2 text-sm font-semibold text-white bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 rounded-xl shadow-md shadow-pink-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
            ☕ Soutenir le projet
          </a>

          {/* --- BOUTONS D'ACTION --- */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://pdubois.lamayenne.e-lyco.fr/contact-et-horaire/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors duration-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Contacter le Collège Pierre Dubois
            </a>

            <a
              href="mailto:contact@vth-mc.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors duration-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Nous Contacter (VTH Group)
            </a>
          </div>

          {/* Texte explicatif (non-bouton) avec lien vers le site */}
          <p className="text-xs text-zinc-500 text-center max-w-2xl my-1 dark:text-zinc-400">
            <a 
              href="https://pdubois.lamayenne.e-lyco.fr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-zinc-900 dark:hover:text-white"
            >
              Site du Collège Pierre Dubois
            </a>
            . Toutes les images affichées sont fournies par le site du Collège Pierre Dubois ou, pour les photos d'articles, par l'équipe de la Boutique Bisous.
          </p>

          {/* Mentions de copyright */}
          <div className="text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Powered by{" "}
              <a 
                href="https://www.vth-mc.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-500 font-semibold hover:underline"
              >
                ©️ VTH Group 2026 - 2027 Tous droits réservés.
              </a>
            </p>

            {/* Message pour les crédits */}
            <p className="text-xs text-zinc-500 mt-2 dark:text-zinc-400">
              Un problème de crédits ? Contactez-nous par e-mail :{" "}
              <a 
                href="mailto:contact@vth-mc.fr" 
                className="text-zinc-900 hover:underline font-medium dark:text-white"
              >
                contact@vth-mc.fr
              </a>
            </p>

            <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
              Site créé pour <span className="text-zinc-900 font-medium dark:text-white">{CLIENT}</span>
            </p>
          </div>

          {/* Statut OSA (Operating Système Alerte) */}
          <OsaStatusBadge />

        </footer>
      </body>
    </html>
  );
}
