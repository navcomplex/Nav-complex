import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NAV COMPLEX | Your Shopping Destination",
  description: "Shop personalized stickers, posters and photo notebooks.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "NAV COMPLEX", statusBarStyle: "black-translucent" }
};
export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1 };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="hi"><body>{children}</body></html>;
}
