"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
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
      <div className="mx-auto flex max-w-3xl flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-foreground px-6 pb-3.5 pt-8">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Link href="/" className="font-bold no-underline">
            {sitename}
          </Link>
          {navigation && navigation.length > 0 && (
            <nav aria-label="Pages" className="flex flex-wrap gap-x-5 gap-y-1">
              {navigation.map((navItem) => {
                const isActive = pathname === navItem.path || pathname.startsWith(navItem.path + '/');
                return (
                  <Link
                    key={navItem.path}
                    href={navItem.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn("underline decoration-1", isActive && "font-bold")}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-sm">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="underline decoration-1"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
