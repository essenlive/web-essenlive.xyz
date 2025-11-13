"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Menu, Github, Mail, LucideLinkedin, LucideInstagram } from "lucide-react"
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


export function Navigation({ sitename, navigation, socials }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-10 font-semibold">
          <Link href="/" className="flex items-center space-x-2 font-semibold">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              {sitename}
            </h1>
          </Link>
          {navigation && (
            <div className="hidden md:flex space-x-1">
              {navigation.map((navItem) => {
                const isActive = pathname === navItem.path || pathname.startsWith(navItem.path + '/');
                return (
                  <Link
                    key={navItem.path}
                    href={navItem.path}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      isActive && "bg-secondary font-semibold"
                    )}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {/* Right Side - Social Links + Theme Toggle */}
        <div className="hidden md:flex items-center gap-2">
          {/* Social Links */}
          {socials?.github && (
            <Link
              href={socials?.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Github className="h-4 w-4" />
            </Link>
          )}
          {socials?.linkedin && (
            <Link
              href={socials?.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <LucideLinkedin className="h-4 w-4" />
            </Link>
          )}
          {socials?.instagram && (
            <Link
              href={socials?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <LucideInstagram className="h-4 w-4" />
            </Link>
          )}
          {socials?.mail && (
            <Link
              href={socials?.mail}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Mail className="h-4 w-4" />
            </Link>
          )}

          <ThemeToggle className={"ml-4"} />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 px-4">
            <SheetHeader>
              <SheetTitle className="text-2xl">{sitename}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-4 mt-8">
              {navigation?.map((navItem) => {
                const isActive = pathname === navItem.path || pathname.startsWith(navItem.path + '/');
                return (
                  <Link
                    key={navItem.path}
                    href={navItem.path}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                      "text-xl h-14",
                      isActive && "bg-secondary font-semibold"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </div>
            <SheetFooter>
              <div className="flex justify-between items-center mt-8 w-full">
                {/* Social Links - Left */}
                <div className="flex items-center gap-2">
                  {socials?.github && (
                    <Link
                      href={socials?.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-12 w-12"
                      )}
                    >
                      <Github className="h-5 w-5" />
                    </Link>
                  )}
                  {socials?.linkedin && (
                    <Link
                      href={socials?.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-12 w-12"
                      )}
                    >
                      <LucideLinkedin className="h-5 w-5" />
                    </Link>
                  )}
                  {socials?.instagram && (
                    <Link
                      href={socials?.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-12 w-12"
                      )}
                    >
                      <LucideInstagram className="h-5 w-5" />
                    </Link>
                  )}
                  {socials?.mail && (
                    <Link
                      href={socials?.mail}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-12 w-12"
                      )}
                    >
                      <Mail className="h-5 w-5" />
                    </Link>
                  )}
                </div>

                {/* Theme Toggle - Right */}
                <ThemeToggle />
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
} 