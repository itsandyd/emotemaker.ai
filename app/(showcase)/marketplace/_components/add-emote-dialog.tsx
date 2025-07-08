"use client"

import { useState, useEffect } from "react";
import { Emote } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Package, Image as ImageIcon, ArrowLeft, Sparkles, DollarSign, GripVertical, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AddEmoteDialogProps {
  userId: string;
}

interface EmoteWithSaleInfo extends Emote {
  watermarkedUrl?: string;
  price?: number;
}

const ITEMS_PER_PAGE = 12;

export default function AddEmoteDialog({ userId }: AddEmoteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'choice' | 'single' | 'pack'>('choice');
  
  // Common state
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [isLoadingEmotes, setIsLoadingEmotes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Single emote state
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pack creation state
  const [selectedEmotes, setSelectedEmotes] = useState<EmoteWithSaleInfo[]>([]);
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [packPrice, setPackPrice] = useState(5.0);
  const [coverEmote, setCoverEmote] = useState<EmoteWithSaleInfo | null>(null);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [packStep, setPackStep] = useState(1);

  // Fetch user's emotes when dialog opens
  useEffect(() => {
    if (open && mode !== 'choice') {
      fetchUserEmotes();
    }
  }, [open, mode, currentPage, userId]);

  const fetchUserEmotes = async () => {
    if (!userId) return;
    
    setIsLoadingEmotes(true);
    try {
      const response = await fetch(`/api/emotes?page=${currentPage}&limit=${ITEMS_PER_PAGE}&userId=${userId}`);
      const data = await response.json();
      
      if (data.emotes) {
        // For single emote mode, filter out emotes already for sale
        // For pack mode, include emotes with watermarks
        const filteredEmotes = mode === 'single' 
          ? data.emotes.filter((emote: Emote & { emoteForSale: any }) => 
              !emote.emoteForSale || emote.emoteForSale.length === 0)
          : data.emotes.filter((emote: any) => emote.watermarkedUrl);
          
        setEmotes(filteredEmotes);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Failed to fetch emotes:', error);
      toast.error('Failed to load your emotes');
    } finally {
      setIsLoadingEmotes(false);
    }
  };

  const resetDialog = () => {
    setMode('choice');
    setSelectedEmote(null);
    setWatermarkedUrl('');
    setPrice('');
    setSelectedEmotes([]);
    setPackName("");
    setPackDescription("");
    setPackPrice(5.0);
    setCoverEmote(null);
    setCustomCoverUrl("");
    setPackStep(1);
    setCurrentPage(1);
  };

  // Single emote functions
  const handleWatermark = async () => {
    if (!selectedEmote) return;
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/emotes/watermark', {
        emoteId: selectedEmote.id,
        imageUrl: selectedEmote.imageUrl,
      }, {
        responseType: 'arraybuffer'
      });

      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

      const uploadResponse = await axios.post('/api/emotes/watermark/upload-watermark', {
        imageBase64,
        emoteId: selectedEmote.id,
      });

      if (uploadResponse.data.watermarkedUrl) {
        setWatermarkedUrl(uploadResponse.data.watermarkedUrl);
        toast.success('Watermark added successfully!');
      } else {
        throw new Error('Failed to get watermarked URL');
      }
    } catch (error) {
      console.error('Failed to add watermark:', error);
      toast.error('Failed to add watermark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleEmoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmote) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/stripe/list-emote', {
        emoteId: selectedEmote.id,
        price: parseFloat(price),
        watermarkedUrl: watermarkedUrl,
      });

      if (response.data.success) {
        toast.success("Emote listed successfully!");
        setOpen(false);
        resetDialog();
        router.refresh();
      } else {
        throw new Error(response.data.error || "Failed to list emote");
      }
    } catch (error) {
      console.error('Failed to list emote:', error);
      toast.error('Failed to list emote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pack creation functions
  const handleEmoteSelect = (emote: Emote) => {
    const emoteWithSaleInfo = emote as EmoteWithSaleInfo;
    if (selectedEmotes.find(e => e.id === emote.id)) {
      setSelectedEmotes(selectedEmotes.filter(e => e.id !== emote.id));
    } else {
      setSelectedEmotes([...selectedEmotes, emoteWithSaleInfo]);
    }
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
        setOpen(false);
        resetDialog();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create pack:', error);
      toast.error('Failed to create pack. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (mode === 'single') {
      setSelectedEmote(null);
      setWatermarkedUrl('');
      setPrice('');
    }
  };

  // Render choice screen
  const renderChoiceScreen = () => (
    <div className="py-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">How would you like to list your emotes?</h3>
        <p className="text-gray-600">Choose between listing a single emote or creating an emote pack.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('single')}>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center">List Single Emote</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Quick and easy setup</li>
              <li>• Individual pricing control</li>
              <li>• Perfect for standalone emotes</li>
              <li>• Immediate listing</li>
            </ul>
            <Button className="w-full mt-4">
              List Single Emote
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('pack')}>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">Create Emote Pack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Bundle multiple emotes</li>
              <li>• Higher earnings potential</li>
              <li>• Attractive bulk pricing</li>
              <li>• Professional presentation</li>
            </ul>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
              Create Emote Pack
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render single emote listing
  const renderSingleEmoteListing = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setMode('choice')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">List Single Emote</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Emote Selection */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Select an Emote</h4>
            
            {isLoadingEmotes ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : emotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No available emotes to list.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create some emotes or check if your existing emotes are already listed.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-2">
                  {emotes.map((emote) => (
                    <div 
                      key={emote.id} 
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedEmote?.id === emote.id 
                          ? 'ring-2 ring-blue-500 scale-105' 
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedEmote(emote)}
                    >
                      <Image
                        src={emote.imageUrl || "/placeholder.png"}
                        alt={emote.prompt || "Emote"}
                        width={80}
                        height={80}
                        className="w-full h-auto object-cover aspect-square"
                      />
                      {selectedEmote?.id === emote.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <Badge className="bg-blue-500">Selected</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Listing Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold">Listing Details</h4>
            
            {selectedEmote && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Emote</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                         <Image
                       src={selectedEmote.imageUrl || "/placeholder.png"}
                       alt={selectedEmote.prompt || "Selected emote"}
                       width={48}
                       height={48}
                       className="object-cover rounded"
                     />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedEmote.prompt}</p>
                      <p className="text-xs text-gray-500">{selectedEmote.style}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Watermark</Label>
                  {watermarkedUrl ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">✓ Watermark applied</p>
                      <Image
                        src={watermarkedUrl}
                        alt="Watermarked emote"
                        width={80}
                        height={80}
                        className="mt-2 rounded object-cover"
                      />
                    </div>
                  ) : (
                    <Button 
                      onClick={handleWatermark}
                      disabled={isLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {isLoading ? "Adding..." : "Add Watermark"}
                    </Button>
                  )}
                </div>

                {watermarkedUrl && (
                  <form onSubmit={handleSingleEmoteSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          min="1.00"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="1.00"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Minimum: $1.00</p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || !price || parseFloat(price) < 1}
                    >
                      {isLoading ? "Listing..." : "List Emote for Sale"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render pack creation (simplified version of the pack creator)
  const renderPackCreation = () => {
    const availableEmotes = emotes.filter(emote => (emote as any).watermarkedUrl);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('choice')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h3 className="text-lg font-semibold">Create Emote Pack</h3>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                packStep >= stepNumber
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>

        {/* Step 1: Select Emotes */}
        {packStep === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Select Emotes ({selectedEmotes.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPackPrice(calculateSuggestedPrice())}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Suggest Price
              </Button>
            </div>

            {isLoadingEmotes ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableEmotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No emotes with watermarks available.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please add watermarks to your emotes before creating packs.
                </p>
              </div>
            ) : (
              <>
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
                             src={(emote as any).watermarkedUrl || emote.imageUrl || "/placeholder.png"}
                             alt={emote.prompt || "Emote"}
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
                           <p className="text-xs font-medium truncate">{emote.prompt || "Emote"}</p>
                           <p className="text-xs text-gray-500">{emote.style || "Unknown"}</p>
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
                    onClick={() => setPackStep(2)}
                    disabled={selectedEmotes.length < 2}
                  >
                    Next: Pack Details
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Pack Details */}
        {packStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Pack Details</h4>
              <Button variant="outline" size="sm" onClick={() => setPackStep(1)}>
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
                            src={emote.watermarkedUrl || emote.imageUrl || "/placeholder.png"}
                            alt={emote.prompt || "Emote"}
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
                  <h5 className="font-medium mb-2">Pack Preview</h5>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {selectedEmotes.slice(0, 4).map((emote) => (
                      <div key={emote.id} className="aspect-square relative">
                        <Image
                          src={emote.watermarkedUrl || emote.imageUrl || "/placeholder.png"}
                          alt={emote.prompt || "Emote"}
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
                onClick={() => setPackStep(3)}
                disabled={!packName.trim() || packPrice < 3}
              >
                Next: Review & Create
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {packStep === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Review & Create</h4>
              <Button variant="outline" size="sm" onClick={() => setPackStep(2)}>
                ← Back
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h5 className="font-medium mb-2">Pack Information</h5>
                  <p className="text-sm"><strong>Name:</strong> {packName}</p>
                  <p className="text-sm"><strong>Description:</strong> {packDescription || "No description"}</p>
                  <p className="text-sm"><strong>Price:</strong> ${packPrice.toFixed(2)}</p>
                  <p className="text-sm"><strong>Emotes:</strong> {selectedEmotes.length}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">Earnings Estimate</h5>
                  <p className="text-sm text-green-700">
                    You'll earn: ${(packPrice * 0.85).toFixed(2)} (15% platform fee)
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Platform fee: ${(packPrice * 0.15).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Emotes in Pack</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedEmotes.map((emote, index) => (
                      <div
                        key={emote.id}
                        className="flex items-center gap-3 p-2 bg-white rounded border"
                      >
                        <span className="text-sm font-medium">{index + 1}</span>
                        <div className="w-12 h-12 relative">
                          <Image
                            src={emote.watermarkedUrl || emote.imageUrl || "/placeholder.png"}
                            alt={emote.prompt || "Emote"}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{emote.prompt || "Emote"}</p>
                          <p className="text-xs text-gray-500">{emote.style || "Unknown"}</p>
                        </div>
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
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          List My Emotes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'choice' && "List Your Emotes"}
            {mode === 'single' && "List Single Emote for Sale"}
            {mode === 'pack' && "Create Emote Pack"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {mode === 'choice' && renderChoiceScreen()}
          {mode === 'single' && renderSingleEmoteListing()}
          {mode === 'pack' && renderPackCreation()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 