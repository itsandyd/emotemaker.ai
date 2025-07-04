"use client";

import Link from "next/link";
import { Montserrat } from 'next/font/google'
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Paintbrush2, StoreIcon, LayoutDashboard, DollarSign } from "lucide-react";

const poppins = Montserrat ({ weight: '600', subsets: ['latin'] });

const routes = [
  {
    label: 'Emoteboard',
    icon: LayoutDashboard,
    href: '/emoteboard/editor/1',
  },
  {
    label: 'Marketplace',
    icon: StoreIcon,
    href: '/marketplace',
  },
  // {
  //   label: 'Pricing',
  //   icon: DollarSign,
  //   href: '/pricing',
  // },
  // {
  //   label: 'Showcase',
  //   icon: StoreIcon,
  //   href: '/showcase',
  // },
];

export const LandingMobileSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <img src="/peepopainter.jpg" alt="Logo" className="rounded-full" />
          </div>
          <h1 className={cn("text-2xl font-bold", poppins.className)}>
            EmoteMaker.ai
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href} 
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-gray-100 rounded-lg transition",
                pathname === route.href ? "text-black bg-gray-100" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};