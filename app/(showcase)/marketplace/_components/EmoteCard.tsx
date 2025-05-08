import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Emote } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

interface EmoteCardProps {
  emote: Emote & { name?: string; price?: number };
  isPack?: boolean;
  showActions?: boolean;
  onPurchase?: (emoteId: string) => void;
}

const EmoteCard = ({ emote, isPack = false, showActions = true, onPurchase }: EmoteCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPurchase) {
      onPurchase(emote.id);
    }
  };

  return (
    <div
      className={cn(
        "bg-dark-lighter rounded-xl overflow-hidden transition transform hover:scale-105 hover:shadow-lg",
        { "relative": isPack }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 flex items-center justify-center bg-dark-light h-40">
        <Image
          src={emote.imageUrl || "/placeholder-emote.png"}
          alt={emote.name || emote.prompt || "Emote"}
          width={160}
          height={160}
          className="object-contain"
        /> 
        
        {isPack && (
          <span className="absolute top-2 right-2 bg-primary px-2 py-1 rounded text-xs font-medium">
            Pack
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1 truncate" title={emote.prompt || ""}>
          {emote.name || emote.prompt || "Untitled Emote"}
        </h3>
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className="text-xs px-2 py-1 bg-dark rounded-full">
            {emote.style || "Standard"}
          </Badge>
          <span className=" font-medium">
            ${emote.price ? emote.price.toFixed(2) : "0.00"}
          </span>
        </div>
        {showActions && (
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/emote/${emote.id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-dark hover:bg-dark-light text-xs py-1.5 rounded text-center transition"
              >
                View Emote
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="w-full bg-primary hover:bg-primary-dark text-xs py-1.5 rounded text-center transition"
              onClick={handlePurchase}
            >
              Purchase
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmoteCard;
