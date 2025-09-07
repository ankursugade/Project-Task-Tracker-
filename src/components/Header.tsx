"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2">
           <Link href="/dashboard/projects" className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline text-primary">
                Projects & Tasks Tracker
            </h1>
           </Link>
        </div>
      </div>
    </header>
  );
}
