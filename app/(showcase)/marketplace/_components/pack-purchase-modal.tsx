"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShoppingCart, Download, Eye, Package, Star, Calendar, User, CreditCard, Lock } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

interface EmotePackItem {
  id: string;
  emoteForSale: {
    id: string;
    imageUrl: string;
    watermarkedUrl?: string;
    prompt: string;
    style: string;
    model: string;
    price: number;
  };
}

interface EmotePack {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  watermarkedUrl?: string;
  createdAt: string;
  userId: string;
  emotePackItems: EmotePackItem[];
}

interface PackPurchaseModalProps {
  pack: EmotePack;
  trigger: React.ReactNode;
  onPurchaseComplete?: () => void;
}

export default function PackPurchaseModal({ pack, trigger, onPurchaseComplete }: PackPurchaseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmoteIndex, setSelectedEmoteIndex] = useState(0);
  const router = useRouter();

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      // Call the pack purchase API
      const response = await axios.post('/api/stripe/purchase-emote-pack', {
        emotePackId: pack.id,
      });
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(`Failed to start checkout: ${errorMessage}`);
      } else {
        toast.error('Failed to start checkout. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedEmote = pack.emotePackItems[selectedEmoteIndex]?.emoteForSale;
  const totalIndividualPrice = pack.emotePackItems.reduce((sum, item) => sum + (item.emoteForSale.price || 0), 0);
  const savings = totalIndividualPrice - pack.price;
  const savingsPercentage = totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {pack.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Preview */}
          <div className="space-y-4">
            {/* Main Preview */}
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {selectedEmote ? (
                <Image
                  src={selectedEmote.watermarkedUrl || selectedEmote.imageUrl}
                  alt={selectedEmote.prompt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Emote Grid */}
            <div className="grid grid-cols-4 gap-2">
              {pack.emotePackItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`aspect-square relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedEmoteIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedEmoteIndex(index)}
                >
                  <Image
                    src={item.emoteForSale.watermarkedUrl || item.emoteForSale.imageUrl}
                    alt={item.emoteForSale.prompt}
                    fill
                    className="object-cover"
                  />
                  {selectedEmoteIndex === index && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Emote Info */}
            {selectedEmote && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{selectedEmote.prompt}</h4>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Style: {selectedEmote.style}</span>
                    <span>Model: {selectedEmote.model}</span>
                  </div>
                  {selectedEmote.price && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Individual price: </span>
                      <span className="font-semibold">${selectedEmote.price.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right side - Purchase Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
              <p className="text-gray-600 mb-4">{pack.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {pack.emotePackItems.length} emotes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(pack.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.8 (12 reviews)</span>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Pack Price</span>
                <span className="text-2xl font-bold text-primary">${pack.price.toFixed(2)}</span>
              </div>
              
              {savings > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Individual prices total:</span>
                    <span className="line-through text-gray-500">${totalIndividualPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">You save:</span>
                    <span className="text-green-600 font-bold">${savings.toFixed(2)} ({savingsPercentage}%)</span>
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Secure checkout with Stripe
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>

            <Separator />

            {/* What's Included */}
            <div>
              <h4 className="font-semibold mb-3">What&apos;s Included</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  High-quality PNG files
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  Instant download access
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  Commercial use license
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  24/7 customer support
                </li>
              </ul>
            </div>

            <Separator />

            {/* Purchase Button */}
            <div className="space-y-3">
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Purchase for ${pack.price.toFixed(2)}
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By purchasing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  💰 Money Back Guarantee
                </Badge>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Not satisfied? Get a full refund within 30 days
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 