"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Users, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navLinks = [
  {
    href: "/dashboard/projects",
    icon: Briefcase,
    label: "Projects",
  },
  {
    href: "/dashboard/team",
    icon: Users,
    label: "Team",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-16 border-r bg-card flex flex-col items-center py-4">
      <Link
        href="/dashboard/projects"
        className="group flex items-center justify-center rounded-lg text-primary mb-4"
      >
        <LayoutGrid className="h-7 w-7 transition-all group-hover:scale-110" />
        <span className="sr-only">ProjectZen</span>
      </Link>
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4">
          {navLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({
                      variant: pathname.startsWith(link.href) ? "secondary" : "ghost",
                      size: "icon",
                    }),
                    "h-10 w-10"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
