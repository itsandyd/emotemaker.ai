import { Editor } from "@/app/features/editor/components/editor";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUserEmotes } from "@/actions/fetchUserEmotes";
import { checkSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";

interface EditorProjectIdPageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    type?: 'video' | 'image';
  };
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

  const emotes = await fetchUserEmotes(userId);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      isAdmin: true,
      subscriptionType: true,
      isActiveSubscriber: true 
    }
  });

  const isPro = await checkSubscription();

  if (!isPro && !user?.isAdmin) {
    redirect('/pricing');
  }

  return (
    <div className="h-screen flex flex-col">
      <Editor 
        userId={userId} 
        emotes={emotes}
        initialWorkspaceType={editorType}
        subscriptionType={user?.subscriptionType || null}
        isActiveSubscriber={user?.isActiveSubscriber || false}
      />
    </div>
  );
};

export default EditorProjectIdPage;