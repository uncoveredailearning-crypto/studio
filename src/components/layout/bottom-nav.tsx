"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, Archive, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Timers", icon: Timer },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-border px-6 pb-safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                isActive ? "bg-accent/10" : "bg-transparent"
              )}>
                <Icon strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}