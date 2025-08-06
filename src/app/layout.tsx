import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cognisia - Enterprise AI Workforce Platform",
  description: "Advanced AI employee creation and management platform for enterprise clients",
  keywords: ["AI", "Enterprise", "Workforce", "Automation", "Cognisia"],
  authors: [{ name: "Cognisia Team" }],
  openGraph: {
    title: "Cognisia - Enterprise AI Workforce Platform",
    description: "Build and manage AI employees that outperform human teams",
    url: "https://cognisia.ai",
    siteName: "Cognisia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognisia - Enterprise AI Workforce Platform",
    description: "Build and manage AI employees that outperform human teams",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
