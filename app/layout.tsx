import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        <footer className="w-full py-4 text-center text-xs text-neutral-400 bg-[#2b2d31] border-t border-[#1e1f22]">
          <p>
            Powered by{" "}
            <span className="text-[#5865F2] font-semibold hover:underline cursor-pointer">
              VTH Group
            </span>
          </p>
        </footer>
      </body>
    </html>
  );
}
