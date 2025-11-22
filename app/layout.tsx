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

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const params = await searchParams;
  const flightNumber = params?.flight || params?.q;

  if (flightNumber && typeof flightNumber === 'string') {
    return {
      title: `Vol ${flightNumber} - Voyages de Céline`,
      description: `Vol ${flightNumber} : Horaires, terminal, porte, météo à destination et temps de trajet vers l'aéroport`,
    };
  }

  return {
    title: "Voyages de Céline",
    description: "Suivi de vol personnel et temps de trajet",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
