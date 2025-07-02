import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Package, ShoppingCart, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MyEmotesPage() {
  const { userId } = auth();
  
  if (!userId) {
    return redirect('/sign-in');
  }

  // Fetch individual emote purchases
  const emotePurchases = await db.purchase.findMany({
    where: {
      userId: userId,
    },
    include: {
      emoteForSale: {
        include: {
          emote: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch pack purchases
  const packPurchases = await db.emotePackPurchase.findMany({
    where: {
      userId: userId,
    },
    include: {
      emotePack: {
        include: {
          emotePackItems: {
            include: {
              emoteForSale: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Count total emotes (individual + from packs)
  const totalIndividualEmotes = emotePurchases.length;
  const totalPackEmotes = packPurchases.reduce(
    (sum, pack) => sum + (pack.emotePack?.emotePackItems.length || 0), 
    0
  );
  const totalEmotes = totalIndividualEmotes + totalPackEmotes;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">My Emotes</h1>
        <p className="text-muted-foreground">
          Manage and download your purchased emotes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-lighter rounded-xl p-6">
          <div className="flex items-center mb-2">
            <ImageIcon className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Total Emotes</h3>
          </div>
          <p className="text-2xl font-semibold">{totalEmotes}</p>
        </div>
        
        <div className="bg-dark-lighter rounded-xl p-6">
          <div className="flex items-center mb-2">
            <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Individual Purchases</h3>
          </div>
          <p className="text-2xl font-semibold">{emotePurchases.length}</p>
        </div>
        
        <div className="bg-dark-lighter rounded-xl p-6">
          <div className="flex items-center mb-2">
            <Package className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Pack Purchases</h3>
          </div>
          <p className="text-2xl font-semibold">{packPurchases.length}</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Purchases</TabsTrigger>
          <TabsTrigger value="emotes">Individual Emotes</TabsTrigger>
          <TabsTrigger value="packs">Emote Packs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {emotePurchases.length === 0 && packPurchases.length === 0 ? (
            <div className="text-center py-12 bg-dark-lighter rounded-xl">
              <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
              <p className="text-muted mb-6">Explore the marketplace to find emotes you like.</p>
              <Link href="/marketplace">
                <Button>Go to Marketplace</Button>
              </Link>
            </div>
          ) : (
            <>
              {packPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-dark-light p-4 flex items-center justify-center">
                      {purchase.emotePack?.imageUrl ? (
                        <div className="relative w-full aspect-square md:w-32 md:h-32">
                          <Image
                            src={purchase.emotePack.imageUrl}
                            alt={purchase.emotePack.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 w-full md:w-32 md:h-32">
                          {purchase.emotePack?.emotePackItems.slice(0, 4).map((item) => (
                            <div key={item.id} className="aspect-square relative bg-dark">
                              {item.emoteForSale.imageUrl && (
                                <Image
                                  src={item.emoteForSale.imageUrl}
                                  alt="Emote preview"
                                  fill
                                  className="object-contain"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{purchase.emotePack?.name}</h3>
                          <p className="text-muted text-sm mb-2">
                            Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Pack • {purchase.emotePack?.emotePackItems.length} emotes
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {purchase.emotePack?.emotePackItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="w-6 h-6 bg-dark-light rounded-sm overflow-hidden">
                            {item.emoteForSale.imageUrl && (
                              <Image
                                src={item.emoteForSale.imageUrl}
                                alt="Emote"
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            )}
                          </div>
                        ))}
                        {(purchase.emotePack?.emotePackItems.length || 0) > 5 && (
                          <div className="w-6 h-6 bg-dark flex items-center justify-center text-xs rounded-sm">
                            +{(purchase.emotePack?.emotePackItems.length || 0) - 5}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/marketplace/download/${purchase.id}`}>
                          <Button size="sm" variant="default" className="flex items-center">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {emotePurchases.map((purchase) => (
                <div key={purchase.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-dark-light p-4 flex items-center justify-center">
                      {purchase.emoteForSale?.imageUrl && (
                        <div className="relative w-full aspect-square md:w-32 md:h-32">
                          <Image
                            src={purchase.emoteForSale.imageUrl}
                            alt={purchase.emoteForSale.prompt || "Emote"}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">
                            {purchase.emoteForSale?.prompt || "Untitled Emote"}
                          </h3>
                          <p className="text-muted text-sm mb-2">
                            Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Single Emote
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/marketplace/download/${purchase.id}`}>
                          <Button size="sm" variant="default" className="flex items-center">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="emotes" className="space-y-6">
          {emotePurchases.length === 0 ? (
            <div className="text-center py-12 bg-dark-lighter rounded-xl">
              <h3 className="text-xl font-medium mb-2">No individual emotes purchased</h3>
              <p className="text-muted mb-6">Browse the marketplace to find individual emotes.</p>
              <Link href="/marketplace">
                <Button>Go to Marketplace</Button>
              </Link>
            </div>
          ) : (
            <>
              {emotePurchases.map((purchase) => (
                <div key={purchase.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-dark-light p-4 flex items-center justify-center">
                      {purchase.emoteForSale?.imageUrl && (
                        <div className="relative w-full aspect-square md:w-32 md:h-32">
                          <Image
                            src={purchase.emoteForSale.imageUrl}
                            alt={purchase.emoteForSale.prompt || "Emote"}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">
                            {purchase.emoteForSale?.prompt || "Untitled Emote"}
                          </h3>
                          <p className="text-muted text-sm mb-2">
                            Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Single Emote
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/marketplace/download/${purchase.id}`}>
                          <Button size="sm" variant="default" className="flex items-center">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="packs" className="space-y-6">
          {packPurchases.length === 0 ? (
            <div className="text-center py-12 bg-dark-lighter rounded-xl">
              <h3 className="text-xl font-medium mb-2">No emote packs purchased</h3>
              <p className="text-muted mb-6">Check out our emote packs in the marketplace.</p>
              <Link href="/marketplace?view=packs">
                <Button>Browse Emote Packs</Button>
              </Link>
            </div>
          ) : (
            <>
              {packPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-dark-light p-4 flex items-center justify-center">
                      {purchase.emotePack?.imageUrl ? (
                        <div className="relative w-full aspect-square md:w-32 md:h-32">
                          <Image
                            src={purchase.emotePack.imageUrl}
                            alt={purchase.emotePack.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 w-full md:w-32 md:h-32">
                          {purchase.emotePack?.emotePackItems.slice(0, 4).map((item) => (
                            <div key={item.id} className="aspect-square relative bg-dark">
                              {item.emoteForSale.imageUrl && (
                                <Image
                                  src={item.emoteForSale.imageUrl}
                                  alt="Emote preview"
                                  fill
                                  className="object-contain"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{purchase.emotePack?.name}</h3>
                          <p className="text-muted text-sm mb-2">
                            Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Pack • {purchase.emotePack?.emotePackItems.length} emotes
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {purchase.emotePack?.emotePackItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="w-6 h-6 bg-dark-light rounded-sm overflow-hidden">
                            {item.emoteForSale.imageUrl && (
                              <Image
                                src={item.emoteForSale.imageUrl}
                                alt="Emote"
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            )}
                          </div>
                        ))}
                        {(purchase.emotePack?.emotePackItems.length || 0) > 5 && (
                          <div className="w-6 h-6 bg-dark flex items-center justify-center text-xs rounded-sm">
                            +{(purchase.emotePack?.emotePackItems.length || 0) - 5}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/marketplace/download/${purchase.id}`}>
                          <Button size="sm" variant="default" className="flex items-center">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 