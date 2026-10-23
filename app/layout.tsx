import "./globals.css";
import { Navigation } from "@/components/navigation";
import { getSiteStructure } from "@/lib/notion";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sitename,structure,  socials } = getSiteStructure();
  const navigation = Object.values(structure)
    .filter((p) => p.path !== "/")
    .map((p) => ({
      title: p.label ?? p.path.slice(1),
      path: p.path,
    }));

  return (
    <html lang="fr">
      <body className="font-sans antialiased min-h-screen">

        {process.env.NODE_ENV !== "development" && (
          <Script
            defer
            src={`${process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID}
            strategy="afterInteractive"
          />
        )}

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-foreground focus:bg-background focus:px-3 focus:py-2"
        >
          Aller au contenu
        </a>
        <div className="relative flex min-h-screen flex-col bg-background text-foreground">
          <Navigation
            sitename={sitename}
            socials={socials}
            navigation={navigation}
          />
          <main id="main" className="flex-1 w-full max-w-3xl mx-auto px-6">
            {children}
          </main>
          <footer className="w-full">
            <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-between gap-x-6 gap-y-1 border-t border-foreground px-6 pb-10 pt-3.5 font-mono text-xs text-muted-foreground">
              <span>polices système · images tramées</span>
              <span>généré depuis Notion</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
