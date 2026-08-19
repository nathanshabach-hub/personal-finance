import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Personal Budgeting",
  title: "Personal Budgeting",
  description: "Production-ready personal budgeting and financial management",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/finance-app-planner.svg", type: "image/svg+xml" },
      { url: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Personal Budgeting",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
