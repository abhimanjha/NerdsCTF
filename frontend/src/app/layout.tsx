import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "nerdCTF - Academy & Cybersecurity Labs",
  description: "Learn advanced penetration testing, reverse engineering, web exploitation, and cryptography with hands-on practice labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#080b11]`}>
        <AuthProvider>
          <div className="fixed inset-0 z-0 matrix-dots opacity-30 pointer-events-none"></div>
          <Navigation />
          <main className="flex-1 flex flex-col z-10 relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
