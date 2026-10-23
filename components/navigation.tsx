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
  socials?: {
    mail?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
};

/** Text links get a taller hit area without moving the layout. */
const linkHit = "inline-block py-2 -my-2";

/** Accepts "me@example.com" or "mailto:me@example.com" */
const mailHref = (mail: string) => (mail.startsWith("mailto:") ? mail : `mailto:${mail}`);

export function Navigation({ sitename, navigation, socials }: NavigationProps) {
  const pathname = usePathname();

  const links = [
    socials?.github && { label: "github", href: socials.github },
    socials?.linkedin && { label: "linkedin", href: socials.linkedin },
    socials?.instagram && { label: "instagram", href: socials.instagram },
    socials?.mail && { label: "mail", href: mailHref(socials.mail) },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-3xl flex-wrap items-baseline justify-between gap-x-6 gap-y-4 border-b border-foreground px-6 pb-3.5 pt-8">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-4">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(linkHit, "font-bold no-underline")}
          >
            {sitename || "essenlive.xyz"}
          </Link>
          {navigation && navigation.length > 0 && (
            <nav aria-label="Pages" className="flex flex-wrap gap-x-5 gap-y-4">
              {navigation.map((navItem) => {
                const isActive = pathname === navItem.path || pathname.startsWith(navItem.path + '/');
                return (
                  <Link
                    key={navItem.path}
                    href={navItem.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(linkHit, "underline decoration-1", isActive && "font-bold")}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-4 font-mono text-sm">
            {links.map((link) => {
              const external = !link.href.startsWith("mailto:");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={cn(linkHit, "underline decoration-1")}
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
