import "./globals.css";
import { Navigation } from "@/components/navigation";
import { getSiteStructure } from "@/lib/notion";
import { PageSize } from "@/components/page-size";
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
        <div className="overflow-x-clip">
        <div className="relative grid min-h-screen w-full grid-rows-[auto_1fr] bg-background text-foreground md:grid-cols-[calc(15rem+50px)_minmax(0,1fr)] md:grid-rows-none">
          <Navigation
            sitename={sitename}
            socials={socials}
            navigation={navigation}
          />
          <div className="flex min-w-0 flex-col px-6 md:pl-10">
            <main id="main" className="flex-1">
              {children}
            </main>
            <footer className="text-meta rule-r relative -mx-6 flex flex-wrap justify-between gap-x-6 px-6 py-3.5 font-mono text-muted-foreground md:-ml-10 md:pl-10">
              <span>polices système · images tramées<span className="hidden sm:inline"> 32 couleurs</span></span>
              <span><PageSize /> · généré le {new Date().toISOString().slice(0, 10)}</span>
            </footer>
          </div>
        </div>
        </div>
      </body>
    </html>
  );
}
