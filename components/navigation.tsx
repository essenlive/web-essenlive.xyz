"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavigationProps {
  sitename: string;
  navigation?: {
    path: string;
    title: string;
  }[];
  socials?: { title: string; url: string }[];
};

/** Text links get a taller hit area without moving the layout. */
const linkHit = "relative after:absolute after:-inset-x-2 after:-inset-y-2 after:content-['']";

/** The › marker hangs in the margin: always on for the current page, fades in on hover for the others. */
const marker = "before:absolute before:-left-3.5 before:font-mono before:content-['›'] before:opacity-0 before:transition-[opacity,translate] before:duration-150 before:-translate-x-1 hover:before:translate-x-0 hover:before:opacity-100";
const current = "before:translate-x-0 before:opacity-100";

/** A bare "me@example.com" becomes a mailto: link; anything with a scheme is kept. */
const href = (url: string) => (/^[a-z][a-z\d+.-]*:/i.test(url) || !url.includes("@") ? url : `mailto:${url}`);

export function Navigation({ sitename, navigation, socials }: NavigationProps) {
  const pathname = usePathname();

  const links = (socials ?? []).filter((l) => l.title && l.url).map((l) => ({ label: l.title, href: href(l.url) }));

  return (
    <header className="bleed-l relative isolate pl-6 md:border-r md:border-foreground">
      {/* Mobile: a ruled strip on top. md+: a sticky margin rail down the left of the page. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 border-b border-foreground pb-3.5 pt-7 md:sticky md:top-0 md:h-screen md:flex-col md:items-start md:justify-between md:border-b-0 md:pb-14 md:pr-6 md:pt-14">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-4 md:flex-col md:gap-x-0 md:gap-y-10">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(linkHit, marker, "font-bold no-underline md:text-title", pathname === "/" && current)}
          >
            {sitename || "essenlive.xyz"}
          </Link>
          {navigation && navigation.length > 0 && (
            <nav aria-label="Pages" className="flex flex-wrap gap-x-5 gap-y-4 md:flex-col md:gap-y-2">
              {navigation.map((navItem) => {
                const isActive = pathname === navItem.path || pathname.startsWith(navItem.path + '/');
                return (
                  <Link
                    key={navItem.path}
                    href={navItem.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(linkHit, marker, "underline decoration-1 md:text-title", isActive && current)}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-4 text-meta font-mono md:flex-col md:gap-y-2">
            {links.map((link) => {
              const external = !link.href.startsWith("mailto:");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={cn(linkHit, "underline decoration-1 after:-inset-y-3")}
                >
                  {link.label}
                  {external && <span className="sr-only"> (nouvel onglet)</span>}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
