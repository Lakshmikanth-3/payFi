import type { Metadata } from "next";
import "../globals.css";
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { GeistPixelLine } from 'geist/font/pixel';
import { Providers } from "@/components/Providers";
import { ToastSystem } from "@/components/ToastSystem";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PayFi Natural Language Payment Protocol",
  description: "The world's first Natural Language Payment Programming Protocol on HashKey Chain",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${GeistPixelLine.variable} font-sans antialiased min-h-screen relative overflow-x-hidden`}>
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
          <ToastSystem />
        </Providers>
      </body>
    </html>
  );
}
