"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Archivo_Black } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"
import DebugInfo from "@/components/debug-info"
import RegisterServiceWorker from "./register-sw"
import { useState, useEffect } from "react"

// Keep Archivo Black just for the logo
const archivoBlack = Archivo_Black({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-archivo-black",
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    // Only run on client
    setIsDevelopment(process.env.NODE_ENV === "development")
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${archivoBlack.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            {children}
            {isDevelopment && <DebugInfo />}
          </ErrorBoundary>
          <RegisterServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  )
}
