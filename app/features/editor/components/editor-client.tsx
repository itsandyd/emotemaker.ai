"use client"

import { Editor } from "./editor"
import type { WorkspaceType } from "../types"
import type { Emote } from "@prisma/client"

interface EditorClientProps {
  userId: string;
  emotes: Emote[];
  initialWorkspaceType?: WorkspaceType;
  subscriptionType?: string | null;
  isActiveSubscriber?: boolean;
}

export const EditorClient = ({ 
  userId, 
  emotes,
  initialWorkspaceType = 'image',
  subscriptionType = null,
  isActiveSubscriber = false
}: EditorClientProps) => {
  return (
    <Editor 
      userId={userId} 
      emotes={emotes}
      initialWorkspaceType={initialWorkspaceType}
      subscriptionType={subscriptionType}
      isActiveSubscriber={isActiveSubscriber}
    />
  )
} 