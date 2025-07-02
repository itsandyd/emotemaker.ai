import { db } from "../lib/db";
import { Emote } from "@prisma/client";
import { cache } from 'react'

interface GetEmoteProps {
    //   userId: string;
      emoteId: string;
    };
    
    export const getEmoteById = cache(async ({
    //   userId,sch
      emoteId,
    }: GetEmoteProps) => {
      try {
        // const purchase = await db.purchaseCourse.findUnique({
        //   where: {
        //     userId_courseId: {
        //       userId,
        //       courseId,
        //     }
        //   }
        // });
    
        const fetchedEmote = await db.emote.findUnique({
          where: {
            // isPublished: true,
            id: emoteId,
          },
        //   select: {
        //     price: true,
        //   }
        });
    
        // const chapter = await db.courseChapter.findUnique({
        //   where: {
        //     id: chapterId,
        //     isPublished: true,
        //   }
        // });
    
        // if (!chapter || !course) {
        //   throw new Error("Chapter or course not found");
        // }
    
        // let muxData = null;
        // let attachments: Attachment[] = [];
        // let nextChapter: CourseChapter | null = null;
    
        // if (purchase) {
        //   attachments = await db.attachment.findMany({
        //     where: {
        //       courseId: courseId
        //     }
        //   });
        // }
    
        // if (chapter.isFree || purchase) {
        //   muxData = await db.muxData.findUnique({
        //     where: {
        //       chapterId: chapterId,
        //     }
        //   });
    
        //   nextChapter = await db.courseChapter.findFirst({
        //     where: {
        //       courseId: courseId,
        //       isPublished: true,
        //       position: {
        //         gt: chapter?.position,
        //       }
        //     },
        //     orderBy: {
        //       position: "asc",
        //     }
        //   });
        // }
    
        // const userProgress = await db.userProgress.findUnique({
        //   where: {
        //     userId_chapterId: {
        //       userId,
        //       chapterId,
        //     }
        //   }
        // });
    
        return fetchedEmote
    } catch (error) {
      console.log("[GET_EMOTE_BY_ID] Error:", error);
      return null;
    }
  });

// Set the revalidation period (e.g., 300 seconds)
export const revalidate = 300;