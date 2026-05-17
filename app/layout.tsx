import type { Metadata } from "next";
import { Inter, Space_Grotesk, Pixelify_Sans, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KvinnResume — AI Resume Operating System",
  description:
    "Upload, parse, enhance, and publish professional resumes with AI. Pixel-powered career terminal for building ATS-optimized resumes.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS optimization",
    "resume parser",
    "career OS",
  ],
  openGraph: {
    title: "KvinnResume — AI Resume Operating System",
    description:
      "Upload, parse, enhance, and publish professional resumes with AI.",
    type: "website",
    siteName: "KvinnResume",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", inter.variable, spaceGrotesk.variable, pixelifySans.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-kr-bg font-ui antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
