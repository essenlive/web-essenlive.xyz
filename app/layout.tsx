import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteStructure } from "@/lib/notion";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sitename,structure,  socials } = getSiteStructure();
  const navigation = Object.values(structure)
    .filter((p) => p.path !== "/")
    .map((p) => ({
      title: p.path.slice(1),
      path: p.path,
    }));

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <Navigation
              sitename={sitename}
              socials={socials}
              navigation={navigation}
            />
            <main className="flex-1 w-full max-w-4xl  mx-auto px-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
