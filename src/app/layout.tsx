import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AnalyticsRoot } from "@/components/analytics/AnalyticsRoot";
import { SkipToContent } from "@/components/SkipToContent";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "עין שנייה — גם לכסף מגיע עין שנייה",
    template: "%s | עין שנייה",
  },
  description:
    "מחשבונים פשוטים לפנסיה, לחיסכון ולהוצאות. רואים איפה אתם עומדים ואיפה יש פער ששווה לבדוק.",
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "עין שנייה — גם לכסף מגיע עין שנייה",
    description:
      "מחשבונים פשוטים לפנסיה, לחיסכון ולהוצאות. רואים איפה אתם עומדים ואיפה יש פער ששווה לבדוק.",
    locale: "he_IL",
    type: "website",
    siteName: "עין שנייה",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d5c63",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-text">
        <SkipToContent />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <AnalyticsRoot />
      </body>
    </html>
  );
}
