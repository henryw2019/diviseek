"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Briefcase, Calendar, BookOpen, User } from "lucide-react";

const tabs = [
  { name: "首页", href: "/", icon: Home },
  { name: "持仓", href: "/holdings", icon: Briefcase },
  { name: "日历", href: "/calendar", icon: Calendar },
  { name: "寻息学堂", href: "/school", icon: BookOpen },
  { name: "我的", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0F172A]/95 backdrop-blur-sm border-t border-[#1E293B] z-50">
      <ul className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 transition-colors ${
                  isActive ? "text-gold" : "text-muted hover:text-foreground"
                }`}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
