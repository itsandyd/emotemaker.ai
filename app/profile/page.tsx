import { auth } from "@clerk/nextjs/server"
import ProfileEmotes from "./_components/ProfileEmotes"
import { db } from "@/lib/db";
import { EmoteHistoryCard } from "./_components/EmoteHistory";
import { ProfileCard } from "./_components/ProfileCard";
import { SocialLinksCard } from "./_components/SocialLinks";
import { Footer } from "./_components/Footer";
import { redirect } from "next/navigation";
import { GuidesForGamersCTA } from "./_components/GuidesForGamers";
import { deleteProfile } from "@/actions/delete-profile";
import { Button } from "@/components/ui/button";
import { PurchasedEmotesCard } from "./_components/PurchasedEmotes";
import { Emote, EmoteForSale } from "@prisma/client";

const ProfilePage = async () => {

    const { userId } = auth();

    if (!userId) (
      redirect('/sign-in')
    )

    let user = await db.user.findUnique({
      where: {
          id: userId!
      }
    });

    if (!user) {
        user = await db.user.create({
            data: {
                id: userId!
                // Add other default fields as necessary
                // name: 
                // email: userId
            }
        });
    }

    // Check if the profile exists, create if not
    let profile = await db.profile.findUnique({
        where: {
            userId: userId!
        }
    });

    if (!profile) {
        profile = await db.profile.create({
            data: {
                userId: userId!
                // Add other default fields as necessary
            }
        });
    }

    const emotes = await db.emote.findMany({
      where: {
        userId: userId,
      },
      include: {
          emoteForSale: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    // Fetch purchased emotes
    const purchasedEmotes = await db.emote.findMany({
      where: {
        users: {
          some: {
            userId: userId!,
          }
        },
        // Exclude emotes that user created themselves
        NOT: {
          userId: userId!,
        }
      },
      include: {
        emoteForSale: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    const handleDeleteProfile = async () => {
      'use server'
      await deleteProfile();
      redirect('/');
    };

    // Check if user has premium subscription based on subscriptionType
    const isPremiumUser = user?.subscriptionType === 'PREMIUM' || 
                         user?.subscriptionType === 'STANDARD' || 
                         user?.subscriptionType === 'LEGACY';

    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        {/* <Header /> */}
        <main className="flex-1 p-4 px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <ProfileCard profile={profile} userId={userId!}/>
            </div>
            <div>
              <SocialLinksCard userId={userId!} profile={profile}/>
            </div>
          </div>
          <div className="py-4">
            <EmoteHistoryCard 
              emotes={emotes} 
              userId={userId!}
              isPremiumUser={isPremiumUser}
            />
          </div>
          {purchasedEmotes.length > 0 && (
            <div className="py-4">
              <PurchasedEmotesCard
                purchasedEmotes={purchasedEmotes as (Emote & { emoteForSale: EmoteForSale | null })[]}
                userId={userId!}
                isPremiumUser={isPremiumUser}
              />
            </div>
          )}
          <div className="py-4">
          <GuidesForGamersCTA />
          </div>
        <div className="py-4">
            <form action={handleDeleteProfile}>
              <Button type="submit" variant="destructive">Delete Profile</Button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
};

export default ProfilePage
