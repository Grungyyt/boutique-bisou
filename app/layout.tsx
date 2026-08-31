import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OsaStatusBadge from "./OsaStatusBadge";

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
      <body className="min-h-full flex flex-col bg-[#313338] text-white">
        
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-6 flex flex-col items-center gap-4 bg-[#2b2d31] border-t border-[#1e1f22] px-4">
          
          {/* Bouton Principal (Soutenir) */}
          <a
            href="https://ko-fi.com/vth"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] rounded transition-colors duration-200 shadow-sm"
          >
            ☕ Soutenir le projet
          </a>

          {/* --- BOUTONS D'ACTION --- */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://pdubois.lamayenne.e-lyco.fr/contact-et-horaire/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#4f545c] hover:bg-[#686d73] rounded transition-colors duration-200"
            >
              Contacter le Collège Pierre Dubois
            </a>

            <a
              href="mailto:contact@vth-mc.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#4f545c] hover:bg-[#686d73] rounded transition-colors duration-200"
            >
              Nous Contacter (VTH Group)
            </a>
          </div>

          {/* Texte explicatif (non-bouton) avec lien vers le site */}
          <p className="text-xs text-neutral-400 text-center max-w-2xl my-1">
            <a 
              href="https://pdubois.lamayenne.e-lyco.fr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Site du Collège Pierre Dubois
            </a>
            . Toutes les images affichées sont fournies par le site du Collège Pierre Dubois ou, pour les photos d'articles, par l'équipe de la Boutique Bisous. (Interviever by Chicken News)
          </p>

          {/* Mentions de copyright */}
          <div className="text-center">
            <p className="text-xs text-neutral-400">
              Powered by{" "}
              <a 
                href="https://www.vth-mc.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5865F2] font-semibold hover:underline"
              >
                ©️ VTH Group 2026 - 2027 Tous droits réservés.
              </a>
            </p>

            {/* Message pour les crédits */}
            <p className="text-xs text-neutral-400 mt-2">
              Un problème de crédits ? Contactez-nous par e-mail :{" "}
              <a 
                href="mailto:contact@vth-mc.fr" 
                className="text-white hover:underline font-medium"
              >
                contact@vth-mc.fr
              </a>
            </p>

            <p className="text-xs text-neutral-400 mt-1">
              Site créé pour <span className="text-white font-medium">{CLIENT}</span>
            </p>
          </div>

          {/* Statut OSA (Operating Système Alerte) */}
          <OsaStatusBadge />

        </footer>
      </body>
    </html>
  );
}
