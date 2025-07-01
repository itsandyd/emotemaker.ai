import { Editor } from "@/app/features/editor/components/editor";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUserEmotes } from "@/actions/fetchUserEmotes";
import { checkSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditorProjectIdPageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    type?: 'video' | 'image';
  };
}

// Separate loading component
function EditorLoading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// Separate error component
function EditorError({ message }: { message: string }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Editor</h2>
        <p className="text-gray-600">{message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Consolidated data fetching function
async function getEditorData(userId: string) {
  try {
    // Use Promise.all to fetch data concurrently instead of sequentially
    const [emotes, user, isPro] = await Promise.all([
      fetchUserEmotes(userId),
      db.user.findUnique({
        where: { id: userId },
        select: { 
          isAdmin: true,
          subscriptionType: true,
          isActiveSubscriber: true 
        }
      }),
      checkSubscription()
    ]);

    return { emotes, user, isPro };
  } catch (error) {
    console.error('Error fetching editor data:', error);
    throw new Error('Failed to load editor data');
  }
}

const EditorProjectIdPage = async ({ 
  params,
  searchParams 
}: EditorProjectIdPageProps) => {
  const { userId } = auth();
  const editorType = searchParams.type || 'image';

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const { emotes, user, isPro } = await getEditorData(userId);

    // Check permissions after data is loaded
    if (!isPro && !user?.isAdmin) {
      redirect('/pricing');
    }

    return (
      <div className="h-screen flex flex-col">
        <Suspense fallback={<EditorLoading />}>
          <Editor 
            userId={userId} 
            emotes={emotes}
            initialWorkspaceType={editorType}
            subscriptionType={user?.subscriptionType || null}
            isActiveSubscriber={user?.isActiveSubscriber || false}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return <EditorError message="Unable to load editor. Please try again." />;
  }
};

export default EditorProjectIdPage;