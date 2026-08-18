import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Naskh_Arabic, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppHeader } from "@/components/chrome";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_NAME,
  description:
    "Private Muslim marriage matching in Australia. Contact is released only after a mutual match and admin review.",
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B3D32",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getDictionary();
  const session = await getSession();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${display.variable} ${body.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <AppHeader
          locale={locale}
          t={t}
          user={session ? { name: session.user.name, role: session.user.role } : null}
        />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
