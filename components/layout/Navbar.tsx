"use client"

import { Navbar as OriginalNavbar } from "../Navbar";

// Create a wrapper component that provides default props
export const Navbar = () => {
  return (
    <OriginalNavbar 
      apiLimitCount={0}
      isPro={false}
      credits={0}
      hasActiveSubscription={false}
    />
  );
}; 