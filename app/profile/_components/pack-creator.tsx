"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, X, GripVertical, Package, Sparkles, DollarSign, Eye, Upload } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface Emote {
  id: string;
  imageUrl: string;
  watermarkedUrl?: string;
  prompt: string;
  style: string;
  model: string;
  price?: number;
}

interface PackCreatorProps {
  userEmotes: Emote[];
  onPackCreated: () => void;
}

interface PackPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  emotes: Emote[];
  coverEmote?: Emote;
  customCoverUrl?: string;
}

export default function PackCreator({ userEmotes, onPackCreated }: PackCreatorProps) {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmotes, setSelectedEmotes] = useState<Emote[]>([]);
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [packPrice, setPackPrice] = useState(5.0);
  const [coverEmote, setCoverEmote] = useState<Emote | null>(null);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [step, setStep] = useState(1);

  // Filter emotes that are available for sale (have watermarks)
  const availableEmotes = userEmotes.filter(emote => emote.watermarkedUrl);

  const resetForm = () => {
    setSelectedEmotes([]);
    setPackName("");
    setPackDescription("");
    setPackPrice(5.0);
    setCoverEmote(null);
    setCustomCoverUrl("");
    setStep(1);
  };

  const handleEmoteSelect = (emote: Emote) => {
    if (selectedEmotes.find(e => e.id === emote.id)) {
      setSelectedEmotes(selectedEmotes.filter(e => e.id !== emote.id));
    } else {
      setSelectedEmotes([...selectedEmotes, emote]);
    }
  };

  const moveEmote = (fromIndex: number, toIndex: number) => {
    const items = Array.from(selectedEmotes);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    setSelectedEmotes(items);
  };

  const calculateSuggestedPrice = () => {
    const basePrice = 3.0;
    const pricePerEmote = 1.5;
    const bulkDiscount = selectedEmotes.length > 5 ? 0.2 : 0;
    const suggestedPrice = basePrice + (selectedEmotes.length * pricePerEmote);
    return Math.max(3.0, suggestedPrice * (1 - bulkDiscount));
  };

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      toast.error("Please enter a pack name");
      return;
    }

    if (selectedEmotes.length < 2) {
      toast.error("Please select at least 2 emotes for your pack");
      return;
    }

    setIsLoading(true);

    try {
      // Create the pack
      const createResponse = await axios.post('/api/emotes/packs/create', {
        name: packName,
        description: packDescription,
        imageUrl: customCoverUrl || coverEmote?.imageUrl || selectedEmotes[0]?.imageUrl,
        coverEmoteId: coverEmote?.id || selectedEmotes[0]?.id,
      });

      if (createResponse.data) {
        // List the pack for sale
        await axios.post('/api/stripe/list-emote-pack', {
          emotePackId: createResponse.data.id,
          price: packPrice,
          watermarkedUrl: customCoverUrl || coverEmote?.watermarkedUrl || selectedEmotes[0]?.watermarkedUrl,
          emoteIds: selectedEmotes.map(e => e.id),
          coverEmoteId: coverEmote?.id || selectedEmotes[0]?.id,
        });

        toast.success("Pack created and listed successfully!");
        setIsOpen(false);
        resetForm();
        onPackCreated();
      }
    } catch (error) {
      console.error('Failed to create pack:', error);
      toast.error('Failed to create pack. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const EmoteSelectionStep = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select Emotes ({selectedEmotes.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPackPrice(calculateSuggestedPrice())}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Suggest Price
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
        {availableEmotes.map((emote) => {
          const isSelected = selectedEmotes.find(e => e.id === emote.id);
          return (
            <div
              key={emote.id}
              className={`relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
              }`}
              onClick={() => handleEmoteSelect(emote)}
            >
              <div className="aspect-square relative">
                <Image
                  src={emote.watermarkedUrl || emote.imageUrl}
                  alt={emote.prompt}
                  fill
                  className="object-cover rounded-lg"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {selectedEmotes.findIndex(e => e.id === emote.id) + 1}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{emote.prompt}</p>
                <p className="text-xs text-gray-500">{emote.style}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedEmotes.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected: {selectedEmotes.length} emotes
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Suggested price: ${calculateSuggestedPrice().toFixed(2)}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setStep(2)}
          disabled={selectedEmotes.length < 2}
        >
          Next: Pack Details
        </Button>
      </div>
    </div>
  );

  const PackDetailsStep = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pack Details</h3>
        <Button variant="outline" size="sm" onClick={() => setStep(1)}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pack-name">Pack Name</Label>
            <Input
              id="pack-name"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Enter a catchy name for your pack"
            />
          </div>

          <div>
            <Label htmlFor="pack-description">Description</Label>
            <Textarea
              id="pack-description"
              value={packDescription}
              onChange={(e) => setPackDescription(e.target.value)}
              placeholder="Describe your emote pack..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="pack-price">Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="pack-price"
                type="number"
                min="3.00"
                step="0.50"
                value={packPrice}
                onChange={(e) => setPackPrice(parseFloat(e.target.value))}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Minimum: $3.00 • Suggested: ${calculateSuggestedPrice().toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {selectedEmotes.slice(0, 3).map((emote) => (
                  <div
                    key={emote.id}
                    className={`aspect-square relative cursor-pointer rounded border-2 transition-all ${
                      coverEmote?.id === emote.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                    }`}
                    onClick={() => setCoverEmote(emote)}
                  >
                    <Image
                      src={emote.watermarkedUrl || emote.imageUrl}
                      alt={emote.prompt}
                      fill
                      className="object-cover rounded"
                    />
                    {coverEmote?.id === emote.id && (
                      <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                        <Badge className="text-xs">Cover</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Input
                placeholder="Or enter custom cover URL"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Pack Preview</h4>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {selectedEmotes.slice(0, 4).map((emote) => (
                <div key={emote.id} className="aspect-square relative">
                  <Image
                    src={emote.watermarkedUrl || emote.imageUrl}
                    alt={emote.prompt}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {selectedEmotes.length} emotes • ${packPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setStep(3)}
          disabled={!packName.trim() || packPrice < 3}
        >
          Next: Review & Create
        </Button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Review & Create</h3>
        <Button variant="outline" size="sm" onClick={() => setStep(2)}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{packName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{packDescription}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${packPrice.toFixed(2)}</span>
                <Badge variant="outline">{selectedEmotes.length} emotes</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Estimated Earnings</h4>
            <p className="text-green-700">
              ${(packPrice * 0.85).toFixed(2)} per sale (after 15% platform fee)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Emotes in Pack</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedEmotes.map((emote, index) => (
                <div
                  key={emote.id}
                  className="flex items-center gap-3 p-2 bg-white rounded border"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="w-12 h-12 relative">
                    <Image
                      src={emote.watermarkedUrl || emote.imageUrl}
                      alt={emote.prompt}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{emote.prompt}</p>
                    <p className="text-xs text-gray-500">{emote.style}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmoteSelect(emote)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCreatePack}
          disabled={isLoading}
          className="min-w-[150px]"
        >
          {isLoading ? "Creating..." : "Create Pack"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Package className="h-4 w-4 mr-2" />
          Create Emote Pack
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Emote Pack
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 1 && <EmoteSelectionStep />}
          {step === 2 && <PackDetailsStep />}
          {step === 3 && <ReviewStep />}
        </div>
      </DialogContent>
    </Dialog>
  );
} 