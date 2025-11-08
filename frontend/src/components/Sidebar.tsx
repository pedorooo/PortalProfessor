"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  ChevronLeft,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/students", label: "Students", icon: Users },
    { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
    {
      href: "/dashboard/evaluation-criteria",
      label: "Evaluation Criteria",
      icon: BookMarked,
    },
    { href: "#", label: "Settings", icon: Settings, disabled: true },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative w-80 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 md:z-auto",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-8 border-b border-sidebar-border flex items-center justify-between md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => onOpenChange(false)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-lg transition-colors w-full",
                isActive(item.href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/40",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
