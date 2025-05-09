"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LandingMobileNavbar } from "./LandingMobileNav";
import { UserAccountNav } from "./UserAccountNav";
import { CreditsDisplay } from "./CreditsDisplay";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Megaphone, HelpCircle, MessageSquare, Lightbulb, DollarSign } from "lucide-react";

const emoteTypes = [
  { name: "Pixel Emotes", link: "/pixels" },
  { name: "Kawaii Emotes", link: "/kawaii" },
  { name: "Object Emotes", link: "/objects" },
  { name: "Cute Bold Line Emotes", link: "/cuteboldlines" },
  { name: "Text Based Emotes", link: "/textbased" },
  { name: "3D Based Emotes", link: "/3d" },
  { name: "Pepe Based Emotes", link: "/pepethefrog" },
  { name: "Sticker Based Emotes", link: "/stickers" },
  { name: "Chibi Emotes", link: "/chibi" },
  { name: "Meme Emotes", link: "/meme" }
];

const tools = [
  { name: "Remove Background", link: "/tools/remove-background" },
  { name: "Image to Prompt", link: "/tools/imagetoprompt" },
  { name: "Whiteboard", link: "/tools/whiteboard" },
];

export const Navbar = ({
  apiLimitCount = 0,
  isPro = false,
  credits = 0,
  hasActiveSubscription = false
}: {
  apiLimitCount: number;
  isPro: boolean;
  credits: number;
  hasActiveSubscription: boolean;
}) => {
  return (
    <header className="dark:bg-gray-900 w-full flex items-center p-4 h-[68px] gap-x-8 border-b z-50 relative">
      <div className="mx-auto flex h-16 items-center justify-between w-full">
        <nav className="flex items-center">
          <LandingMobileNavbar />
          <NavigationMenu className="flex items-center">
            <Button variant="link" className="flex items-center">
              <Link href="/" className="flex items-center">
                <Avatar className="mr-2">
                  <AvatarImage src="/peepopainter.jpg" />
                </Avatar>
                <span className="text-lg font-semibold">EmoteMaker.ai</span>
              </Link>
            </Button>
            <Button variant="ghost" className="hidden sm:block">
              <Link href="/emoteboard/editor/1">Emoteboard</Link>
            </Button>
            <Button variant="ghost" className="hidden sm:block">
              <Link href="/marketplace">Marketplace</Link>
            </Button>
            <NavigationMenuList className="hidden sm:flex">
              {/* <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <a>Create Emotes</a>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="mt-0 flex">
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {emoteTypes.map((type) => (
                      <ListItem
                        key={type.name}
                        title={type.name}
                        href={type.link}
                      >
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}
              {/* <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <a>Tools</a>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="mt-0 flex">
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {tools.map((type) => (
                      <ListItem
                        key={type.name}
                        title={type.name}
                        href={type.link}
                      >
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}
            </NavigationMenuList>
            {/* <Button variant="ghost" className="hidden sm:block">
              <Link href="/marketplace">Marketplace</Link>
            </Button> */}
          </NavigationMenu>
        </nav>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-black">
                <Zap className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-2">
              {/* <DropdownMenuItem className="flex items-start p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                <Megaphone className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">What&apos;s new?</div>
                  <div className="text-xs text-gray-500 mt-1">Discover our recent additions and updates.</div>
                </div>
              </DropdownMenuItem> */}
              <DropdownMenuItem className="flex items-start p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                <HelpCircle className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">Knowledge Center</div>
                  <div className="text-xs text-gray-500 mt-1">Explore our comprehensive Knowledge Center.</div>
                </div>
                <Link href="/knowledge-center" className="absolute inset-0">
                  <span className="sr-only">Go to Knowledge Center</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                <MessageSquare className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">Community Hub</div>
                  <div className="text-xs text-gray-500 mt-1">Join our Discord for networking and support.</div>
                </div>
                <Link href="https://discord.gg/tc7TWbnSKc" className="absolute inset-0" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">Go to Discord community</span>
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="flex items-start p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                <Lightbulb className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">Feedback & Suggestions</div>
                  <div className="text-xs text-gray-500 mt-1">Request or upvote upcoming features.</div>
                </div>
              </DropdownMenuItem> */}
              <DropdownMenuItem className="flex items-start p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                <DollarSign className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">Refer a friend</div>
                  <div className="text-xs text-gray-500 mt-1">Earn 10% on paid referrals.</div>
                </div>
                <Link href="https://emotemaker.getrewardful.com" className="absolute inset-0" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">Go to referral program</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SignedIn>
            {hasActiveSubscription && <CreditsDisplay credits={credits} />}
            <div className="ml-4">
              <UserAccountNav isPro={isPro} />
            </div>
          </SignedIn>
          <SignedOut>
            <Button variant="ghost">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import * as React from "react";
import { cn } from "@/lib/utils"; // Ensure you have a utility function to handle classnames
import { Star, Zap } from "lucide-react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
});
ListItem.displayName = "ListItem";
