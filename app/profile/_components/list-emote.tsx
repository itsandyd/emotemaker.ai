"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import { Emote, EmoteForSale } from "@prisma/client"
import Image from "next/image"
import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ListEmoteProps {
  emotes: Emote[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ListEmote({ emotes, totalPages, currentPage, onPageChange }: ListEmoteProps) {
  const router = useRouter();
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      console.log('Upload response:', uploadResponse.data); // Add this line for debugging

      if (uploadResponse.data.watermarkedUrl) {
        setWatermarkedUrl(uploadResponse.data.watermarkedUrl);
        toast.success('Watermark added and uploaded successfully!');
      } else {
        throw new Error('Failed to get watermarked URL');
      }
    } catch (error) {
      console.error('Failed to add watermark:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data); // Add this line for debugging
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        router.push('/profile');
      } else {
        throw new Error(response.data.error || "Failed to list emote");
      }
    } catch (error) {
      console.error('Failed to list emote:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to list emote. Please try again.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to list emote. Please try again.');
      } else {
        toast.error('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select an Emote</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto p-2">
              {emotes.map((emote) => (
                <div 
                  key={emote.id} 
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${selectedEmote?.id === emote.id ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
                  onClick={() => setSelectedEmote(emote)}
                >
                  <Image
                    src={emote.imageUrl || "/placeholder.png"}
                    alt={emote.prompt || "Emote"}
                    width={100}
                    height={100}
                    className="w-full h-auto object-cover aspect-square"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">List Your Emote</h2>
            {selectedEmote ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <Image
                    alt="Selected Emote"
                    className="w-32 h-32 object-contain rounded-lg"
                    src={watermarkedUrl || selectedEmote.imageUrl || "/placeholder.png"}
                    width={128}
                    height={128}
                  />
                </div>
                <div>
                  <Label htmlFor="watermark">Watermark</Label>
                  <Button 
                    type="button" 
                    onClick={handleWatermark} 
                    disabled={isLoading || !!watermarkedUrl}
                    className="w-full mt-1"
                  >
                    {watermarkedUrl ? "Watermark Added" : "Add Watermark"}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <p className="mt-1 text-sm">{selectedEmote.prompt}</p>
                </div>
                <div>
                  <Label htmlFor="price">Price (minimum $1.00)</Label>
                  <Input 
                    id="price" 
                    placeholder="Enter the price" 
                    type="number"
                    min="1.00"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required 
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !watermarkedUrl}>
                  {isLoading ? "Listing..." : "List Emote"}
                </Button>
              </form>
            ) : (
              <div className="text-center text-gray-500">
                Select an emote to list it for sale
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
