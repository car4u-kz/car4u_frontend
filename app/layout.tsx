import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline } from "@mui/material";

import Providers from "./providers";

import "./globals.css";
import { AppHeader } from "@/components";
import { AuthProvider } from "@/context/auth-context";
import { OrganizationProvider } from "@/context/organization-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Автомобильный бизнес консалтинг",
  description:
    'Система автоматизации бизнеса автомобилей с пробегом по принципу "одного окна"',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AppRouterCacheProvider>
            <CssBaseline />
            <Providers>
              <AuthProvider>
                <OrganizationProvider>
                  <AppHeader />
                  {children}
                </OrganizationProvider>
              </AuthProvider>
            </Providers>
          </AppRouterCacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
