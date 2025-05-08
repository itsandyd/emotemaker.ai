"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmotePack, EmoteForSale, Emote } from "@prisma/client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Check, X, ArrowRight, Plus, Image as ImageIcon, Loader2 } from "lucide-react"
import { Hint } from "@/components/hint"
import { Badge } from "@/components/ui/badge"
import { getEmotesForSale } from "@/actions/get-emotes-for-sale"

interface ListEmotePackProps {
  emotePacks: any[];    
  totalPages: number;
  currentPage: number;
}

export default function ListEmotePack({ emotePacks, totalPages, currentPage }: ListEmotePackProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coverEmoteForSaleId, setCoverEmoteForSaleId] = useState<string>('');
  const [allEmotesForSale, setAllEmotesForSale] = useState<any[]>([]);
  const [selectedEmotes, setSelectedEmotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [emoteWatermarkStatus, setEmoteWatermarkStatus] = useState<{[id: string]: boolean}>({});
  const [isWatermarkingAll, setIsWatermarkingAll] = useState(false);

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    router.push(`${pathname}?page=${page}`);
  };

  useEffect(() => {
    if (selectedPack) {
      setIsCreatingNew(false);
      setName(selectedPack.name || '');
      setDescription(selectedPack.description || '');
      setImageUrl(selectedPack.imageUrl || '');
      setWatermarkedUrl(selectedPack.watermarkedUrl || '');
      setPrice(selectedPack.price?.toString() || '');
      
      // Extract emote IDs from the pack
      const packEmoteIds = selectedPack.emotePackItems?.map(
        (item: any) => item.emoteForSaleId
      ) || [];
      setSelectedEmotes(packEmoteIds);
      
      // If the pack has a coverEmoteForSaleId, set it
      if (selectedPack.coverEmoteForSaleId) {
        setCoverEmoteForSaleId(selectedPack.coverEmoteForSaleId);
      } else if (selectedPack.imageUrl) {
        // If no coverEmoteForSaleId but there's an imageUrl, keep using that
        setImageUrl(selectedPack.imageUrl);
      }
    }
  }, [selectedPack]);

  useEffect(() => {
    if (open && isCreatingNew) {
      resetForm();
      // Focus on the name input when dialog opens for new pack
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, isCreatingNew]);

  useEffect(() => {
    loadAllEmotes();
  }, []);

  useEffect(() => {
    console.log('All emotes for sale loaded:', allEmotesForSale);
    console.log('Selected emotes:', selectedEmotes);
    
    if (allEmotesForSale.length > 0 && selectedEmotes.length > 0) {
      // Create the watermark status tracking
      const status: {[id: string]: boolean} = {};
      selectedEmotes.forEach(id => {
        const emoteForSale = allEmotesForSale.find(e => e.id === id);
        status[id] = !!emoteForSale?.watermarkedUrl;
      });
      
      setEmoteWatermarkStatus(status);
      console.log('Watermark status:', status);
    }
  }, [selectedEmotes, allEmotesForSale]);

  const loadAllEmotes = async () => {
    try {
      // Use the server action instead of direct API call
      const { emotesForSale } = await getEmotesForSale({ 
        itemsPerPage: 100 // Get more items than the default
      });
      
      setAllEmotesForSale(emotesForSale);
    } catch (error) {
      console.error('Failed to load emotes for sale:', error);
      toast.error('Failed to load your emotes.');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setWatermarkedUrl('');
    setPrice('');
    setSelectedEmotes([]);
    setCoverEmoteForSaleId('');
  };

  const handleCreateNewClick = () => {
    setSelectedPack(null);
    setIsCreatingNew(true);
    setOpen(true);
  };

  const handleEditPack = (pack: any) => {
    setSelectedPack(pack);
    setIsCreatingNew(false);
    setOpen(true);
  };

  const createNewPack = async () => {
    if (!name) {
      toast.error('Pack name is required');
      return;
    }

    setIsCreating(true);
    try {
      // If a cover emote is selected, use its imageUrl, but it's optional now
      const coverId = coverEmoteForSaleId || '';
      const coverEmote = allEmotesForSale.find(emote => emote.id === coverId);
      const finalImageUrl = coverEmote ? coverEmote.imageUrl : imageUrl;

      const response = await axios.post('/api/emotes/packs/create', {
        name,
        description,
        imageUrl: finalImageUrl, // This can be empty now
        coverEmoteId: coverId, // Keep this name for API compatibility
      });

      if (response.data) {
        setSelectedPack(response.data);
        setIsCreatingNew(false);
        toast.success('Pack created successfully!');
        // Keep dialog open to continue editing
      }
    } catch (error) {
      console.error('Failed to create pack:', error);
      toast.error('Failed to create emote pack. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleWatermark = async () => {
    if (!selectedPack) return;
    
    const finalImageUrl = getCoverImageUrl();
    if (!finalImageUrl) {
      toast.error('Please select a cover image first');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/emotes/packs/watermark', {
        emotePackId: selectedPack.id,
        imageUrl: finalImageUrl,
      }, {
        responseType: 'arraybuffer'
      });

      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

      const uploadResponse = await axios.post('/api/emotes/packs/upload-watermark', {
        imageBase64,
        emotePackId: selectedPack.id,
      });

      if (uploadResponse.data.watermarkedUrl) {
        setWatermarkedUrl(uploadResponse.data.watermarkedUrl);
        toast.success('Watermark added and uploaded successfully!');
      } else {
        throw new Error('Failed to get watermarked URL');
      }
    } catch (error) {
      console.error('Failed to add watermark:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to add watermark. Please try again.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to add watermark. Please try again.');
      } else {
        toast.error('An unknown error occurred while adding watermark. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmoteSelection = (emoteId: string) => {
    if (selectedEmotes.includes(emoteId)) {
      setSelectedEmotes(selectedEmotes.filter(id => id !== emoteId));
      // If this was the cover emote, clear the cover emote
      if (coverEmoteForSaleId === emoteId) {
        setCoverEmoteForSaleId('');
      }
    } else {
      setSelectedEmotes([...selectedEmotes, emoteId]);
    }
  };

  const setCoverEmote = (emoteId: string) => {
    // Make sure the emote is selected before setting as cover
    if (!selectedEmotes.includes(emoteId)) {
      setSelectedEmotes([...selectedEmotes, emoteId]);
    }
    
    setCoverEmoteForSaleId(emoteId);
    
    // Find the emote to use its imageUrl
    const emote = allEmotesForSale.find(e => e.id === emoteId);
    if (emote) {
      setImageUrl(emote.imageUrl);
    }
  };

  const getCoverImageUrl = () => {
    if (coverEmoteForSaleId) {
      const coverEmote = allEmotesForSale.find(emote => {
        // First check if the emoteForSale ID matches
        if (emote.id === coverEmoteForSaleId) return true;
        // As a fallback, check if the emote ID matches
        if (emote.emoteId === coverEmoteForSaleId) return true;
        return false;
      });
      
      return coverEmote?.imageUrl || imageUrl;
    }
    return imageUrl;
  };

  // Function to get the original emote ID from any ID (emote or emoteForSale)
  const getOriginalEmoteId = (id: string) => {
    const emote = allEmotesForSale.find(e => {
      return e.id === id || e.emoteId === id;
    });
    return emote?.id;
  };
  
  // Add a new watermarking function for EmoteForSale
  const watermarkEmoteForSale = async (emoteForSaleId: string) => {
    try {
      console.log(`Starting watermark process for emoteForSale ID: ${emoteForSaleId}`);
      
      // Find the emote for sale
      const emoteForSale = allEmotesForSale.find(e => e.id === emoteForSaleId);
      
      if (!emoteForSale) {
        console.error(`No emote for sale found with ID: ${emoteForSaleId}`);
        toast.error('Emote for sale not found');
        return false;
      }
      
      // If already watermarked, no need to process
      if (emoteForSale.watermarkedUrl) {
        console.log(`Emote already has watermark: ${emoteForSale.watermarkedUrl}`);
        return true;
      }

      // Get the related emote ID
      const emoteId = emoteForSale.emoteId;
      if (!emoteId) {
        console.error('EmoteForSale has no associated emote ID');
        toast.error('Failed to find original emote');
        return false;
      }
      
      // Call the watermark API
      console.log(`Calling watermark API for emote ID: ${emoteId}`);
      const response = await axios.post(`/api/emotes/watermark`, {
        emoteId,
        imageUrl: emoteForSale.imageUrl
      }, {
        responseType: 'arraybuffer'
      });

      // Upload the watermarked image
      console.log('Watermark generated, uploading...');
      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
      const uploadResponse = await axios.post('/api/emotes/watermark/upload-watermark', {
        imageBase64,
        emoteId,
      });

      if (uploadResponse.data.watermarkedUrl) {
        console.log(`Watermark uploaded: ${uploadResponse.data.watermarkedUrl}`);
        
        // Update local state to reflect the watermark
        setEmoteWatermarkStatus(prev => ({
          ...prev,
          [emoteForSaleId]: true
        }));
        
        // Refresh to get updated watermark URLs
        await loadAllEmotes();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to watermark emote ${emoteForSaleId}:`, error);
      toast.error('Failed to watermark emote');
      return false;
    }
  };

  // Function to watermark a single emote
  const watermarkEmote = async (emoteForSaleId: string) => {
    try {
      console.log(`Starting watermark process for emoteForSale ID: ${emoteForSaleId}`);
      
      // Find the emote for sale record
      const emoteForSale = allEmotesForSale.find(e => e.id === emoteForSaleId);
      
      if (!emoteForSale) {
        console.error(`No emote for sale found with ID: ${emoteForSaleId}`);
        toast.error(`Emote not found`);
        return false;
      }
      
      console.log('Emote for sale to watermark:', {
        id: emoteForSale.id,
        imageUrl: emoteForSale.imageUrl,
        emoteId: emoteForSale.emoteId,
        watermarkedUrl: emoteForSale.watermarkedUrl
      });
      
      // If already watermarked, no need to process
      if (emoteForSale.watermarkedUrl) {
        console.log(`Emote already has watermark: ${emoteForSale.watermarkedUrl}`);
        return true;
      }
      
      // Call the watermark API with the emote ID
      console.log(`Calling watermark API for emote ID: ${emoteForSale.emoteId}`);
      const response = await axios.post(`/api/emotes/watermark`, {
        emoteId: emoteForSale.emoteId,
        imageUrl: emoteForSale.imageUrl
      }, {
        responseType: 'arraybuffer'
      });

      console.log('Watermark generated, uploading...');
      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

      // Upload the watermarked image
      const uploadResponse = await axios.post('/api/emotes/watermark/upload-watermark', {
        imageBase64,
        emoteId: emoteForSale.emoteId,
      });

      if (uploadResponse.data.watermarkedUrl) {
        console.log(`Watermark uploaded: ${uploadResponse.data.watermarkedUrl}`);
        // Update local state to reflect the watermark
        setEmoteWatermarkStatus(prev => ({
          ...prev,
          [emoteForSaleId]: true
        }));
        
        // Refresh to get updated watermark URLs
        await loadAllEmotes();
        
        return true;
      }
      
      console.error('No watermarkedUrl in response:', uploadResponse.data);
      return false;
    } catch (error) {
      console.error(`Failed to watermark emote ${emoteForSaleId}:`, error);
      if (axios.isAxiosError(error) && error.response?.data) {
        // Try to get the actual error message from the response
        let errorMessage = '';
        if (error.response.data instanceof ArrayBuffer) {
          try {
            const text = new TextDecoder().decode(error.response.data);
            errorMessage = text;
          } catch (e) {
            errorMessage = 'Error decoding response';
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.statusText) {
          errorMessage = error.response.statusText;
        } else {
          errorMessage = error.message;
        }
        
        console.error('Detailed error:', errorMessage);
        toast.error(`Failed to watermark: ${errorMessage}`);
      } else if (error instanceof Error) {
        toast.error(`Failed to watermark emote: ${error.message}`);
      } else {
        toast.error('Failed to watermark emote: Unknown error');
      }
      return false;
    }
  };

  // Function to watermark all selected emotes
  const watermarkAllEmotes = async () => {
    if (selectedEmotes.length === 0) {
      toast.error('No emotes selected');
      return;
    }

    setIsWatermarkingAll(true);
    const toastId = toast.loading('Watermarking emotes... This may take a moment.');

    try {
      // Filter to get only emotes without watermarks
      const emoteIdsToWatermark = selectedEmotes.filter(id => !emoteWatermarkStatus[id]);
      
      if (emoteIdsToWatermark.length === 0) {
        toast.success('All selected emotes already have watermarks', { id: toastId });
        setIsWatermarkingAll(false);
        return;
      }
      
      let success = 0;
      let failed = 0;
      
      console.log(`Starting watermarking for ${emoteIdsToWatermark.length} emotes`);
      
      // Process each emote in sequence
      for (const emoteId of emoteIdsToWatermark) {
        console.log(`Processing emote ID: ${emoteId}`);
        const result = await watermarkEmoteForSale(emoteId);
        if (result) {
          success++;
          toast.loading(`Watermarked ${success}/${emoteIdsToWatermark.length} emotes...`, { id: toastId });
        } else {
          failed++;
        }
      }
      
      // Refresh data to get updated watermark URLs
      await loadAllEmotes();
      
      if (failed === 0) {
        toast.success(`Successfully watermarked ${success} emotes`, { id: toastId });
      } else {
        toast.error(`Watermarked ${success} emotes, ${failed} failed. Try again to retry failed emotes.`, { id: toastId });
      }
    } catch (error) {
      console.error('Failed to watermark all emotes:', error);
      toast.error('Failed to watermark emotes', { id: toastId });
    } finally {
      setIsWatermarkingAll(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;
    if (selectedEmotes.length === 0) {
      toast.error('Please select at least one emote for the pack');
      return;
    }
    
    // Ensure we have a cover emote or image URL
    const finalImageUrl = getCoverImageUrl();
    const hasWatermark = !!watermarkedUrl;
    const hasCoverEmote = !!coverEmoteForSaleId;
    const hasCoverImage = !!finalImageUrl;
    
    console.log("Cover validation:", { 
      hasCoverEmote, 
      hasCoverImage, 
      hasWatermark, 
      coverEmoteForSaleId, 
      imageUrl: finalImageUrl 
    });
    
    if (!hasWatermark && !hasCoverImage) {
      toast.error('Please select a cover image for your pack');
      return;
    }
    
    // Check if all selected emotes have watermarks
    const unwatermarkedEmotes = selectedEmotes.filter(id => !emoteWatermarkStatus[id]);
    if (unwatermarkedEmotes.length > 0) {
      toast.error(`${unwatermarkedEmotes.length} emotes don&apos;t have watermarks. Please apply watermarks to all emotes first.`);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post('/api/stripe/list-emote-pack', {
        emotePackId: selectedPack.id,
        price: parseFloat(price),
        watermarkedUrl: watermarkedUrl || finalImageUrl, // Use image URL as fallback if no watermark
        emoteIds: selectedEmotes,
        coverEmoteId: coverEmoteForSaleId, // Keep this name for API compatibility
      });

      if (response.data.success) {
        toast.success("Emote pack listed successfully!");
        setOpen(false);
        router.push('/profile');
        router.refresh();
      } else {
        throw new Error(response.data.error || "Failed to list emote pack");
      }
    } catch (error) {
      console.error('Failed to list emote pack:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to list emote pack. Please try again.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to list emote pack. Please try again.');
      } else {
        toast.error('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Emote Packs</h2>
              <Button onClick={handleCreateNewClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Pack
              </Button>
            </div>
            
            {emotePacks.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto p-2">
                  {emotePacks.map((pack) => (
                    <div 
                      key={pack.id} 
                      className="relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105"
                      onClick={() => handleEditPack(pack)}
                    >
                      <Image
                        src={pack.watermarkedUrl || pack.imageUrl || "/placeholder.png"}
                        alt={pack.name || "Emote Pack"}
                        width={200}
                        height={200}
                        className="w-full h-auto object-cover aspect-square"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                        <p className="text-white text-sm font-semibold truncate">{pack.name}</p>
                        <p className="text-white text-xs">{pack.emotePackItems?.length || 0} emotes</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You don&apos;t have any emote packs yet.</p>
                <Button 
                  onClick={handleCreateNewClick}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Pack
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreatingNew 
                  ? 'Create New Emote Pack' 
                  : selectedPack 
                    ? `Edit Pack: ${selectedPack.name}` 
                    : 'Emote Pack'}
              </DialogTitle>
              <DialogDescription>
                {isCreatingNew 
                  ? 'Fill out the details below and click "Create Pack"'
                  : 'Edit your emote pack details and add emotes'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Pack Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter a name for your pack" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                      ref={nameInputRef}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your emote pack" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {!coverEmoteForSaleId && (
                    <div>
                      <Label htmlFor="imageUrl">Cover Image URL (if not using an emote as cover)</Label>
                      <Input 
                        id="imageUrl" 
                        placeholder="Enter image URL for pack cover" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {!isCreatingNew && selectedPack && (
                    <div>
                      <Label htmlFor="price">Pack Price (minimum $1.00)</Label>
                      <Input 
                        id="price" 
                        placeholder="Enter the price" 
                        type="number"
                        min="1.00"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {isCreatingNew ? (
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                      <p className="flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        After creating your pack, you&apos;ll be able to add emotes and set a price before publishing.
                      </p>
                    </div>
                  ) : selectedPack && (
                    <>
                      <div>
                        <Label htmlFor="cover">Cover Preview</Label>
                        <div className="flex justify-center mt-2 mb-4">
                          <Image
                            alt="Pack Cover"
                            className="w-32 h-32 object-contain rounded-lg"
                            src={watermarkedUrl || getCoverImageUrl() || "/placeholder.png"}
                            width={128}
                            height={128}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleWatermark} 
                          disabled={isLoading || (!imageUrl && !coverEmoteForSaleId) || !!watermarkedUrl}
                          className="w-full mt-1"
                        >
                          {watermarkedUrl ? "Watermark Added" : "Add Watermark"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Emote selection section */}
              <div className="mt-4">
                <Label className="text-base font-semibold">
                  {isCreatingNew ? "Select emotes after creation" : "Select Emotes for Pack"}
                </Label>
                {!isCreatingNew && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 mt-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                    {allEmotesForSale.length > 0 ? (
                      allEmotesForSale.map((emote) => {
                        const emoteId = emote.id;
                        const hasWatermark = !!emote.watermarkedUrl;
                        const isSelected = selectedEmotes.includes(emoteId);
                        
                        return (
                          <div 
                            key={emoteId} 
                            className={`
                              relative cursor-pointer rounded-lg overflow-hidden
                              transition-all duration-150 group
                              ${isSelected
                                ? 'ring-2 ring-primary' 
                                : 'opacity-80 hover:opacity-100 hover:shadow-md'}
                              ${isSelected && !hasWatermark ? 'ring-amber-500' : ''}
                            `}
                          >
                            <div className="aspect-square relative">
                              <Image
                                src={emote.imageUrl}
                                alt={emote.prompt || "Emote"}
                                fill
                                className="object-cover"
                              />
                              
                              {/* Status indicators with badges */}
                              <div className="absolute top-1 right-1 flex gap-1">
                                {coverEmoteForSaleId === emoteId && (
                                  <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-500 text-white h-5 px-1.5">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    Cover
                                  </Badge>
                                )}
                                {isSelected && !coverEmoteForSaleId && (
                                  <Badge variant="secondary" className="bg-primary hover:bg-primary text-white h-5 px-1.5">
                                    <Check className="h-3 w-3" />
                                  </Badge>
                                )}
                                {isSelected && !hasWatermark && (
                                  <Badge variant="outline" className="bg-red-500 hover:bg-red-500 text-white h-5 px-1.5">
                                    No Watermark
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Truncated prompt overlay at bottom */}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-white text-xs truncate">
                                {emote.prompt ? emote.prompt.substring(0, 15) : "Emote"}
                              </div>
                            </div>
                            
                            {/* Simplified hover controls overlay - just icons */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className="flex gap-2">
                                <Hint label={isSelected ? "Remove from pack" : "Add to pack"} side="bottom">
                                  <Button
                                    variant="secondary" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleEmoteSelection(emoteId);
                                    }}
                                  >
                                    {isSelected ? 
                                      <X className="h-4 w-4" /> : 
                                      <Plus className="h-4 w-4" />
                                    }
                                  </Button>
                                </Hint>
                                
                                <Hint label={coverEmoteForSaleId === emoteId ? "Remove cover image" : "Set as cover image"} side="bottom">
                                  <Button
                                    variant={coverEmoteForSaleId === emoteId ? "destructive" : "secondary"}
                                    size="icon"
                                    className={`h-8 w-8 rounded-full shadow-md ${coverEmoteForSaleId === emoteId ? "" : "bg-white/90 hover:bg-white"}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (coverEmoteForSaleId === emoteId) {
                                        setCoverEmoteForSaleId('');
                                      } else {
                                        setCoverEmoteForSaleId(emoteId);
                                      }
                                    }}
                                  >
                                    <ImageIcon className="h-4 w-4" />
                                  </Button>
                                </Hint>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-6 text-center py-4">
                        <p className="text-gray-500 text-sm">No emotes available for sale.</p>
                        <p className="text-gray-500 text-xs mt-1">Create and list some emotes first.</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {selectedEmotes.length} emotes
                  {coverEmoteForSaleId && ' • Cover image selected'}
                </p>
              </div>
              
              {/* Add a watermark all button if needed */}
              {selectedEmotes.length > 0 && selectedEmotes.some(id => !emoteWatermarkStatus[id]) && (
                <div className="mt-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={watermarkAllEmotes}
                    disabled={isWatermarkingAll}
                    className="w-full"
                  >
                    {isWatermarkingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Watermarking Emotes...
                      </>
                    ) : (
                      <>
                        Apply Watermarks to {selectedEmotes.filter(id => !emoteWatermarkStatus[id]).length} Selected Emotes
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <DialogFooter className="mt-6">
                {isCreatingNew ? (
                  <Button 
                    type="button" 
                    onClick={createNewPack}
                    disabled={isCreating || !name}
                  >
                    {isCreating ? "Creating..." : "Create Pack"}
                  </Button>
                ) : selectedPack && (
                  <Button 
                    type="submit" 
                    disabled={isLoading || !watermarkedUrl || selectedEmotes.length === 0}
                  >
                    {isLoading ? "Publishing..." : "Publish Emote Pack"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 