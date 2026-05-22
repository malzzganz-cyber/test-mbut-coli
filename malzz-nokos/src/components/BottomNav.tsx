import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Wallet, ShoppingCart, Clock, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const BottomNav = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/deposit", icon: Wallet, label: "Deposit" },
    { href: "/order", icon: ShoppingCart, label: "Order" },
    { href: "/history", icon: Clock, label: "History" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-[380px]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] rounded-full">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? "bg-primary text-black border-2 border-black" : "text-gray-500 hover:text-black hover:bg-gray-100"}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
