"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Space_Grotesk, Archivo_Black, Space_Mono } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"
import DebugInfo from "@/components/debug-info"
import RegisterServiceWorker from "./register-sw"
import { useState, useEffect } from "react"

// Primary display font - geometric, bold, and distinctive
const archivoBlack = Archivo_Black({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-archivo-black",
})

// Secondary geometric sans-serif for headings and emphasis
const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

// Monospace font for data, numbers, and technical information
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
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
      <body className={`${spaceGrotesk.variable} ${archivoBlack.variable} ${spaceMono.variable}`}>
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
