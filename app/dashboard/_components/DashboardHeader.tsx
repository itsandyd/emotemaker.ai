import { UserResource } from "@clerk/types"
import { Button } from "@/components/ui/button"
import { CreditsDisplay } from "@/components/CreditsDisplay"
import { Zap } from "lucide-react"

interface DashboardHeaderProps {
    user: UserResource | null
    isPro: boolean
    credits: number
    router: any
}

export function DashboardHeader({ user, isPro, credits, router }: DashboardHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'User'}!</h1>
            <div className="flex items-center space-x-4">
                <CreditsDisplay credits={credits} />
                {!isPro && (
                    <Button onClick={() => router.push('/upgrade')} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Button>
                )}
            </div>
        </div>
    )
}