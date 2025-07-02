import { db } from "@/lib/db";
import Showcase from "./_components/showcase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 20;

export default async function ShowcasePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const style = typeof searchParams.style === 'string' ? searchParams.style : undefined;
  const model = typeof searchParams.model === 'string' ? searchParams.model : undefined;

  const where = {
    AND: [
      search ? { prompt: { contains: search } } : {},
      style ? { style: { equals: style } } : {},
      model ? { model: { equals: model } } : {},
    ]
  };

  const totalCount = await db.emote.count({ where });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const emotes = await db.emote.findMany({
    where,
    take: ITEMS_PER_PAGE,
    skip: (page - 1) * ITEMS_PER_PAGE,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch unique styles and models
  const styles = await db.emote.findMany({
    select: { style: true },
    distinct: ['style'],
    where: { style: { not: null } },
  });

  const models = await db.emote.findMany({
    select: { model: true },
    distinct: ['model'],
    where: { model: { not: null } },
  });

  return (
    <Showcase
      initialEmotes={emotes}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      itemsPerPage={ITEMS_PER_PAGE}
      styles={styles.map(s => s.style!).filter(Boolean)}
      models={models.map(m => m.model!).filter(Boolean)}
    />
  );
}
