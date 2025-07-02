import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUserEmotes } from "@/actions/fetchUserEmotes";
import { checkSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Palette, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

// Dynamically import the Editor with no SSR to prevent server-side execution of browser-only code
const EditorClient = dynamic(() => import("@/app/features/editor/components/editor-client").then(mod => ({ default: mod.EditorClient })), {
  ssr: false,
  loading: () => <EditorLoading />
});

interface EditorProjectIdPageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    type?: 'video' | 'image';
  };
}

// Enhanced loading component with animations
function EditorLoading() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Animated icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin absolute -top-2 -left-2" />
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">Loading Editor</h3>
              <p className="text-gray-600">Preparing your creative workspace...</p>
            </div>
            
            {/* Animated skeleton elements */}
            <div className="w-full space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced error component with better styling
function EditorError({ message }: { message: string }) {
  return (
    <div className="h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg border-red-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Error icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* Error text */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-800">Unable to Load Editor</h2>
              <p className="text-gray-600 leading-relaxed">{message}</p>
              <p className="text-sm text-gray-500">
                This might be a temporary issue. Please try again.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <Suspense fallback={<EditorLoading />}>
      <EditorClient 
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