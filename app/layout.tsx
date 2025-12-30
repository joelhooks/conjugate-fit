import type React from "react";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conjugate Fitness - Weight Calculator",
  description: "Weight calculator for barbell exercises",
  manifest: "/manifest.json",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
