"use client"

import { EmoteForSale, Emote } from "@prisma/client";
import { EmotePackWithItems } from "@/actions/get-emote-packs";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmoteCard } from "@/components/emotes/EmoteCard";
import EmotePacksGrid from "./EmotePacksGrid";
import AddEmoteDialog from "./add-emote-dialog";
import { Search, Filter, Package, Image, TrendingUp, Star, Clock, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface MarketplaceProps {
  initialEmotesForSale: (EmoteForSale & { emote: Emote })[];
  userEmotes: (Emote & { emoteForSale: EmoteForSale | null })[];
  emotePacks: EmotePackWithItems[];
  userId: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  packsCurrentPage?: number;
  packsTotalPages?: number;
  packsTotalCount?: number;
  
  // Enhanced props
  availableStyles?: string[];
  availableModels?: string[];
  initialFilters?: {
    search: string;
    style: string;
    model: string;
    priceRange: string | null;
    sortBy: string;
    tab: string;
  };
  stats?: {
    totalEmotes: number;
    totalPacks: number;
    newThisWeek: number;
    activeFilters: number;
  };
}

export default function Marketplace({ 
  initialEmotesForSale, 
  userEmotes, 
  emotePacks = [],
  userId, 
  currentPage, 
  totalPages, 
  totalCount,
  packsCurrentPage = 1,
  packsTotalPages = 1,
  packsTotalCount = 0,
  
  // Enhanced props
  availableStyles = [],
  availableModels = [],
  initialFilters = {
    search: "",
    style: "",
    model: "",
    priceRange: null,
    sortBy: "newest",
    tab: "emotes",
  },
  stats = {
    totalEmotes: totalCount,
    totalPacks: packsTotalCount,
    newThisWeek: 0,
    activeFilters: 0,
  },
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [selectedStyle, setSelectedStyle] = useState(initialFilters.style || "all");
  const [selectedModel, setSelectedModel] = useState(initialFilters.model || "all");
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || "all");
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);
  const [activeTab, setActiveTab] = useState(initialFilters.tab);
  const [filteredEmotes, setFilteredEmotes] = useState(initialEmotesForSale);
  const [filteredPacks, setFilteredPacks] = useState(emotePacks);

  // Use server-provided filter options or fallback to client-side generation
  const styles = availableStyles.length > 0 
    ? availableStyles 
    : [...new Set(initialEmotesForSale.map(item => item.style).filter(Boolean))] as string[];
  
  const models = availableModels.length > 0 
    ? availableModels 
    : [...new Set(initialEmotesForSale.map(item => item.model).filter(Boolean))] as string[];

  // Filter and sort emotes
  useEffect(() => {
    let filtered = [...initialEmotesForSale];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.style && item.style.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply style filter
    if (selectedStyle !== "all" && selectedStyle !== "") {
      filtered = filtered.filter(item => item.style === selectedStyle);
    }

    // Apply model filter
    if (selectedModel !== "all" && selectedModel !== "") {
      filtered = filtered.filter(item => item.model === selectedModel);
    }

    // Apply price filter
    if (priceRange !== "all") {
      filtered = filtered.filter(item => {
        const price = item.price;
        if (price === null) return false;
        switch (priceRange) {
          case "under-5": return price < 5;
          case "5-10": return price >= 5 && price <= 10;
          case "10-20": return price >= 10 && price <= 20;
          case "over-20": return price > 20;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "popular":
          // For now, just sort by newest as we don't have popularity data
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredEmotes(filtered);
  }, [searchTerm, selectedStyle, selectedModel, priceRange, sortBy, initialEmotesForSale]);

  // Filter packs based on search
  useEffect(() => {
    let filtered = [...emotePacks];

    if (searchTerm) {
      filtered = filtered.filter(pack => 
        pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pack.description && pack.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort packs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredPacks(filtered);
  }, [searchTerm, sortBy, emotePacks]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStyle("all");
    setSelectedModel("all");
    setPriceRange("all");
    setSortBy("newest");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    selectedStyle !== "all" && selectedStyle !== "",
    selectedModel !== "all" && selectedModel !== "",
    priceRange !== "all",
    sortBy !== "newest"
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Emote Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Discover and purchase unique emotes created by talented artists from around the world
            </p>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <p className="text-sm text-gray-600">
                Have amazing emotes? Share them with the community!
              </p>
              <AddEmoteDialog userId={userId} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Emotes</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalEmotes.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Emote Packs</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalPacks.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New This Week</p>
                <p className="text-lg font-semibold text-gray-900">{stats.newThisWeek}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search emotes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Style Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Style
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {styles.map(style => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Model
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Range
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-5">Under $5</SelectItem>
                      <SelectItem value="5-10">$5 - $10</SelectItem>
                      <SelectItem value="10-20">$10 - $20</SelectItem>
                      <SelectItem value="over-20">Over $20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="emotes" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Individual Emotes
                  </TabsTrigger>
                  <TabsTrigger value="packs" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Emote Packs
                  </TabsTrigger>
                </TabsList>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Newest
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="price-low">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Price: Low to High
                        </div>
                      </SelectItem>
                      <SelectItem value="price-high">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Price: High to Low
                        </div>
                      </SelectItem>
                      <SelectItem value="popular">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Most Popular
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="emotes">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {filteredEmotes.length} of {totalCount} emotes
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-600">
                        Search results for &quot;{searchTerm}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {filteredEmotes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmotes.map((emoteForSale) => (
                      <Card key={emoteForSale.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={`/marketplace/emote/${emoteForSale.id}`} className="block">
                          <div className="aspect-square relative">
                            <img 
                              src={emoteForSale.watermarkedUrl || emoteForSale.imageUrl} 
                              alt={emoteForSale.prompt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-sm mb-2 line-clamp-2">{emoteForSale.prompt}</h3>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {emoteForSale.style && <span className="mr-2">{emoteForSale.style}</span>}
                                {emoteForSale.model && <span>{emoteForSale.model}</span>}
                              </div>
                              <div className="text-lg font-bold text-primary">
                                ${emoteForSale.price || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No emotes found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="packs">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {filteredPacks.length} of {packsTotalCount} packs
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-600">
                        Search results for &quot;{searchTerm}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {filteredPacks.length > 0 ? (
                  <EmotePacksGrid emotePacks={filteredPacks} />
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No packs found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
