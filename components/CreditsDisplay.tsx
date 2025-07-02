"use client";

import { Coins } from "lucide-react";
import Link from "next/link";

export const CreditsDisplay = ({ 
  credits, 
  hasActiveSubscription = true 
}: { 
  credits: number; 
  hasActiveSubscription?: boolean;
}) => {
    return (
      <div className="text-sm font-semibold mx-2 flex items-center">
        {hasActiveSubscription ? (
          <div className="flex items-center">
            <Coins className="mx-2 w-4 h-4" />
            <p>{credits}</p>
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground hover:text-primary">
            <Coins className="mx-2 w-4 h-4" />
            <p className="hidden sm:block">No active subscription</p>
            <p className="sm:hidden">No active sub</p>
          </div>
        )}
      </div>
    );
};