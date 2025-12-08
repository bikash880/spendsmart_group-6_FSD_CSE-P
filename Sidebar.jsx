"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet } from "lucide-react";

export default function Sidebar() {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/budgets", label: "Budgets", icon: Wallet },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">SpendSmart</h1>
            <p className="text-xs text-gray-500">Personal Finance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <div className="p-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 font-medium">Track your finances</p>
        <p className="text-xs text-gray-400 mt-1">
          Stay on top of your spending
        </p>
      </div>
    </div>
  );
}
