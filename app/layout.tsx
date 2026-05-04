import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEB Consultant Toolkit",
  description: "A mock Pre-AEB readiness workbench for consultant-led customer data workshops.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
