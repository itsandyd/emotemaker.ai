import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { LandingMobileSidebar } from "./LandingMobileSidebar";

export const LandingMobileNavbar = () => {
    return ( 
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white">
                <LandingMobileSidebar />
            </SheetContent>
        </Sheet>
     );
}