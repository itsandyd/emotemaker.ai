import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, HelpCircle, FileText, Headphones } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { EmoteForSale, Emote, EmotePack, Purchase, EmotePackPurchase } from "@prisma/client";

interface DownloadPageProps {
  params: {
    id: string;
  };
}

interface EmoteWithDetails extends EmoteForSale {
  emote?: Emote;
}

interface SingleEmotePurchaseData {
  purchase: Purchase;
  item: EmoteWithDetails;
  emotes: EmoteWithDetails[];
  isEmotePurchase: true;
}

interface EmotePackPurchaseData {
  purchase: EmotePackPurchase;
  item: EmotePack;
  emotes: EmoteWithDetails[];
  isEmotePurchase: false;
}

type PurchaseData = SingleEmotePurchaseData | EmotePackPurchaseData;

async function getPurchaseById(purchaseId: string): Promise<PurchaseData | null> {
  try {
    // First, check if it's an emote purchase
    const emotePurchase = await db.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        emoteForSale: {
          include: {
            emote: true
          }
        }
      }
    });

    if (emotePurchase && emotePurchase.emoteForSale) {
      return {
        purchase: emotePurchase,
        item: emotePurchase.emoteForSale as EmoteWithDetails,
        emotes: [],
        isEmotePurchase: true
      };
    }

    // If not emote purchase, check if it's a pack purchase
    const packPurchase = await db.emotePackPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        emotePack: {
          include: {
            emotePackItems: {
              include: {
                emoteForSale: {
                  include: {
                    emote: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (packPurchase && packPurchase.emotePack) {
      const emoteItems = packPurchase.emotePack.emotePackItems.map(
        item => item.emoteForSale as EmoteWithDetails
      );
      
      return {
        purchase: packPurchase,
        item: packPurchase.emotePack,
        emotes: emoteItems,
        isEmotePurchase: false
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return null;
  }
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    return notFound();
  }

  const data = await getPurchaseById(params.id);

  if (!data || !data.purchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Purchase not found</h3>
          <p className="text-muted mb-4">The purchase you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { purchase, item, emotes, isEmotePurchase } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-dark-lighter rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Thank you for your purchase!</h1>
            <div className="flex items-center">
              <span className="text-xs px-2 py-1 bg-success text-dark rounded-full font-medium">Payment Complete</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Download Your Emotes</h2>
            <p className="text-muted mb-4">Your purchase includes the following emotes in all available sizes. Click the download button next to each size to save the file.</p>
          </div>

          {isEmotePurchase ? (
            // Single emote purchase
            <div className="bg-dark p-4 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden bg-dark-light flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.prompt || "Emote"} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.prompt || "Untitled Emote"}</h3>
                  <p className="text-xs text-muted mb-2">{item.style || "Standard"} style</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a 
                      href={item.imageUrl || "#"} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                    >
                      Original
                    </a>
                    <a 
                      href={item.imageUrl || "#"} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                    >
                      128px (Discord)
                    </a>
                    <a 
                      href={item.imageUrl || "#"} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                    >
                      112px (Twitch)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Pack purchase with multiple emotes
            <>
              {emotes.map((emote) => (
                <div key={emote.id} className="bg-dark p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    {emote.imageUrl && (
                      <div className="w-16 h-16 rounded overflow-hidden bg-dark-light flex-shrink-0">
                        <img 
                          src={emote.imageUrl} 
                          alt={emote.prompt || "Emote"} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{emote.prompt || "Untitled Emote"}</h3>
                      <p className="text-xs text-muted mb-2">{emote.style || "Standard"} style</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <a 
                          href={emote.imageUrl || "#"} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                        >
                          Original
                        </a>
                        <a 
                          href={emote.imageUrl || "#"} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                        >
                          128px (Discord)
                        </a>
                        <a 
                          href={emote.imageUrl || "#"} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs px-3 py-1 bg-dark-light hover:bg-dark-lighter rounded transition"
                        >
                          112px (Twitch)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-dark-light">
            <Link href="/marketplace">
              <Button variant="outline" className="bg-dark hover:bg-dark-light transition">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
            <Link href="/my-emotes">
              <Button variant="outline" className="bg-dark hover:bg-dark-light transition">
                View Your Purchases
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/faq" className="bg-dark-light hover:bg-dark transition p-4 rounded-lg flex flex-col items-center text-center">
              <HelpCircle className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">FAQ</h3>
              <p className="text-xs text-muted">Find answers to common questions</p>
            </Link>
            <Link href="/docs" className="bg-dark-light hover:bg-dark transition p-4 rounded-lg flex flex-col items-center text-center">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Documentation</h3>
              <p className="text-xs text-muted">Learn how to use your emotes</p>
            </Link>
            <Link href="/support" className="bg-dark-light hover:bg-dark transition p-4 rounded-lg flex flex-col items-center text-center">
              <Headphones className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Support</h3>
              <p className="text-xs text-muted">Contact our support team</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 