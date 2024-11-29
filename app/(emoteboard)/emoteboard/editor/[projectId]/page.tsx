import { Editor } from "@/app/features/editor/components/editor";

import { auth } from "@clerk/nextjs/server";
import { getEmotes } from "../../../../../actions/get-emotes";
import { redirect } from "next/navigation";
import { fetchUserEmotes } from "@/actions/fetchUserEmotes";
import { checkSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";

const EditorProjectIdPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const emotes = await fetchUserEmotes(userId);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  const isPro = await checkSubscription()

  if (!isPro && !user?.isAdmin) {
    redirect('/pricing')
  }

  return (
    <div className="h-screen flex flex-col">
      <Editor userId={userId} emotes={emotes} />
    </div>
  );
};

export default EditorProjectIdPage;