"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { checkSubscription } from "@/lib/subscription"
import { DashboardHeader } from "./DashboardHeader"
import { CreativeTools } from "./CreativeTools"
import { UseCases } from "./UseCases"

interface DashboardContentProps {
  credits: number;
}

export function DashboardContent({ credits }: DashboardContentProps) {
//   const { user, isLoaded, isSignedIn } = useUser()
//   const router = useRouter()
//   const [isPro, setIsPro] = useState(false)

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (isLoaded && isSignedIn) {
//         try {
//           const proStatus = await checkSubscription()
//           setIsPro(proStatus)
//         } catch (error) {
//           console.error("Error fetching user data:", error)
//         }
//       }
//     }
//     fetchUserData()
//   }, [isLoaded, isSignedIn])

//   if (!isLoaded) {
//     return <div>Loading...</div>
//   }

//   if (!isSignedIn) {
//     router.push('/sign-in')
//     return null
//   }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <DashboardHeader user={user} isPro={isPro} credits={credits} router={router} /> */}
      <CreativeTools />
      <UseCases />
    </div>
  )
}