"use client"

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { CreditCardIcon, DollarSignIcon, DotIcon, Star, Download } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Switch } from "@/components/ui/switch"

const pricingPlans = [
  {
    name: "Creator",
    monthlyPrice: 15,
    yearlyPrice: 150,
    monthlyCredits: 150,
    yearlyCredits: 1800,
    features: [
      "Standard resolution emotes",
      "Basic editing tools",
      "Platform-specific sizes (Discord, Twitch)",
    ]
  },
  {
    name: "Pro",
    monthlyPrice: 45,
    yearlyPrice: 485,
    monthlyCredits: 500,
    yearlyCredits: 6000,
    features: [
      "Advanced AI features",
      "Premium editing tools",
      "Platform-specific sizes",
      "Full resolution downloads for merchandise"
    ]
  },
  {
    name: "Team",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    monthlyCredits: 1250,
    yearlyCredits: 15000,
    features: [
      "All Pro features",
      "Team collaboration tools",
      "Priority support",
      "Full resolution downloads for merchandise"
    ]
  }
]

export const PricingHero = ({
    isPro = false
  }: {
    isPro: boolean;
  }) => {

    const [loadingStates, setLoadingStates] = useState({
      Creator: false,
      Pro: false,
      Team: false
    });
    const [isAnnual, setIsAnnual] = useState(false);

    const onSubscribe = async (plan: string, interval: "monthly" | "annually") => {
        try {
          setLoadingStates(prev => ({ ...prev, [plan]: true }));
          const response = await axios.get(`/api/stripe/subscriptions/updated/${interval}/${plan.toLowerCase()}`);
          window.location.href = response.data.url;
        } catch (error: unknown) {
          console.error("Subscription error:", error instanceof Error ? error.message : String(error));
          if (axios.isAxiosError(error) && error.response) {
            console.error("Response data:", error.response.data);
          }
          toast.error("Something went wrong. Please try again later.");
        } finally {
          setLoadingStates(prev => ({ ...prev, [plan]: false }));
        }
      };

    return (
      <div className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-white px-3 py-1 text-sm text-purple-600">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">
                Simple pricing for everyone
              </h2>
              <p className="max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose a plan that fits your needs. No hidden costs, cancel anytime.
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <span className="text-white">Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <span className="text-white">Annual (Save up to 17%)</span>
            </div>
          </div>
          <div className="mx-auto mt-5 grid max-w-screen-lg grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className="flex flex-col bg-white rounded-lg shadow-lg">
                <CardHeader className="px-6 py-4 border-b">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-lg text-gray-500">
                    ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}/{isAnnual ? 'year' : 'month'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-purple-500" />
                      <span>{isAnnual ? plan.yearlyCredits : plan.monthlyCredits} credits/{isAnnual ? 'year' : 'month'}</span>
                    </li>
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.includes("Full resolution downloads") ? (
                          <>
                            <Download className="h-5 w-5 text-purple-500" />
                            <span className="font-semibold">{feature}</span>
                          </>
                        ) : (
                          <>
                            <Star className="h-5 w-5 text-purple-500" />
                            <span>{feature}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="px-6 py-4 border-t">
                  <Button 
                    className="w-full bg-purple-500 text-white hover:bg-purple-600" 
                    onClick={() => onSubscribe(plan.name, isAnnual ? 'annually' : 'monthly')}
                    disabled={loadingStates[plan.name as keyof typeof loadingStates]}
                  >
                    {loadingStates[plan.name as keyof typeof loadingStates] ? 'Loading...' : `Choose ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

export default PricingHero

