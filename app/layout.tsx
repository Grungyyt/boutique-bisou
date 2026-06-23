import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

CLIENT = Collège Pierre DuBois

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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#313338] text-white">
        {/* Contenu principal de l'application */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer style Discord Ext */}
        <footer className="w-full py-6 flex flex-col items-center gap-3 bg-[#2b2d31] border-t border-[#1e1f22]">
          {/* Bouton Soutenir le projet */}
          <a
            href="https://ko-fi.com/vth"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] rounded transition-colors duration-200 shadow-sm"
          >
            ☕ Soutenir le projet
          </a>

          {/* Mentions de copyright */}
          <p className="text-xs text-neutral-400">
            Powered by{" "}
            <a 
              href="https://www.vth-mc.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#5865F2] font-semibold hover:underline"
            >
              VTH Group 2026 - 2027 Tous droit Réservé Site Crée Pour {CLIENT}
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
