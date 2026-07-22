import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import FloatingHealthAssistant from "@/components/floating-health-assistant";
import { Suspense } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "MediMeet — Connect with Doctors",
  description: "Book appointments, consult via video, and manage your healthcare journey.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${jakarta.variable} font-sans antialiased`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="h-16" />}>
              <Header />
            </Suspense>
            <main className="min-h-screen pt-20">{children}</main>
            <Toaster richColors position="top-right" />
            <FloatingHealthAssistant />

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
