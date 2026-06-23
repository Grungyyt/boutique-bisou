import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Variable CLIENT corrigée
const CLIENT = "Collège Pierre DuBois";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BisouData -- By VTH Group",
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
        <footer className="w-full py-6 flex flex-col items-center gap-4 bg-[#2b2d31] border-t border-[#1e1f22]">
          
          {/* Bouton Principal (Soutenir) */}
          <a
            href="https://ko-fi.com/vth"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] rounded transition-colors duration-200 shadow-sm"
          >
            ☕ Soutenir le projet
          </a>

          {/* --- BLOC DE 3 BOUTONS CUSTOMIZABLES --- */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="URL_DU_LIEN_1" // <-- Remplace par ton premier lien
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#4f545c] hover:bg-[#686d73] rounded transition-colors duration-200"
            >
              Mon Bouton 1
            </a>

            <a
              href="URL_DU_LIEN_2" // <-- Remplace par ton deuxième lien
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#4f545c] hover:bg-[#686d73] rounded transition-colors duration-200"
            >
              Mon Bouton 2
            </a>

            <a
              href="https://pdubois.lamayenne.e-lyco.fr/" // <-- Remplace par ton troisième lien
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#4f545c] hover:bg-[#686d73] rounded transition-colors duration-200"
            >
              Site Collège Pierre DuBois
            </a>
          </div>
          {/* -------------------------------------- */}

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
                VTH Group 2026 - 2027 Tous droits réservés.
              </a>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Site créé pour <span className="text-white font-medium">{CLIENT}</span>
            </p>
          </div>

        </footer>
      </body>
    </html>
  );
}
