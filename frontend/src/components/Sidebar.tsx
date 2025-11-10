"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    {
      href: "/dashboard",
      label: "Painel",
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      href: "/dashboard/students",
      label: "Alunos",
      icon: Users,
      disabled: false,
    },
    {
      href: "/dashboard/classes",
      label: "Turmas",
      icon: BookOpen,
      disabled: false,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black/60 md:hidden z-[45] cursor-default"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar menu"
          onKeyDown={(e) => {
            if (e.key === "Escape") onOpenChange(false);
          }}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 md:relative w-64 md:w-80 h-screen md:h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out z-[50] md:z-auto flex flex-col shadow-lg md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header mobile com botão de fechar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between md:hidden shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-gray-100">
            <BookOpen className="w-5 h-5" />
            <span>Menu</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-lg transition-colors w-full",
                isActive(item.href)
                  ? "bg-purple-600 text-white font-semibold shadow-md"
                  : "text-sidebar-foreground hover:bg-purple-600/20 hover:text-purple-700",
                item.disabled &&
                  "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="text-base md:text-lg font-medium">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
