import { Suspense } from 'react'
import { DashboardContent } from './_components/DashboardContent'
import { DashboardSkeleton } from './_components/DashboardSkeleton'
import { getUserCredits } from "@/actions/get-user-credits"
import { checkSubscription } from "@/lib/subscription"
import { redirect } from 'next/navigation'
import { ProfileFormDialog } from './_components/ProfileFormSheet'
import { getProfile } from '@/actions/get-profile'
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const credits = await getUserCredits()
  const isPro = await checkSubscription()
  const profile = await getProfile()

  // Fetch user to check admin status
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  // If user is not pro and not an admin, redirect to pricing
  if (!isPro && !user?.isAdmin) {
    redirect('/pricing')
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {!profile && <ProfileFormDialog />}
      <DashboardContent credits={credits} />
    </Suspense>
  )
}