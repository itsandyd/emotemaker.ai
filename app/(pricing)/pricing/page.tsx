/**
 * v0 by Vercel.
 * @see https://v0.dev/t/zbEUPYPfKaK
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import PricingHero from "./_components/Hero"
import Image from "next/image"
import { ChevronDownIcon } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default function Component() {
    const { userId } = auth();
  
    if (!userId) {
      return redirect('/sign-in');
    }

    const isPro = true 
  return (
   <div>
    <PricingHero isPro={isPro}/>
      {/* <div className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Testimonials</h2>
              <p className="mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See what our customers have to say about our product.
              </p>
              <div className="mt-8 grid gap-6">
                <blockquote className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                  &quot;This product has been a game-changer for our business. The features are incredibly robust, and the
                    support team is top-notch.&quot;
                  </p>
                  <div className="mt-4 flex items-center">
                    <Image
                      alt="Avatar"
                      className="rounded-full"
                      height={48}
                      src="/placeholder.svg"
                      style={{
                        aspectRatio: "48/48",
                        objectFit: "cover",
                      }}
                      width={48}
                    />
                    <div className="ml-4">
                      <div className="font-semibold">John Doe</div>
                      <div className="text-gray-500 dark:text-gray-400">CEO, Acme Inc.</div>
                    </div>
                  </div>
                </blockquote>
                <blockquote className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                  &quot;The seamless integration with our existing systems has saved us countless hours and improved our
                    overall efficiency.&quot;
                  </p>
                  <div className="mt-4 flex items-center">
                    <Image
                      alt="Avatar"
                      className="rounded-full"
                      height={48}
                      src="/placeholder.svg"
                      style={{
                        aspectRatio: "48/48",
                        objectFit: "cover",
                      }}
                      width={48}
                    />
                    <div className="ml-4">
                      <div className="font-semibold">Jane Smith</div>
                      <div className="text-gray-500 dark:text-gray-400">CTO, Globex Corp.</div>
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions? We&apos;ve got answers.
              </p>
              <div className="mt-8 grid gap-6">
                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4 text-left text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    What is your refund policy?
                    <ChevronDownIcon className="ml-4 h-5 w-5 transition-transform" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="rounded-lg bg-gray-100 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    We offer a 30-day money-back guarantee on all our plans. If you&apos;re not satisfied with our product,
                    simply contact our support team, and we&apos;ll process a full refund.
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4 text-left text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    How do I upgrade or downgrade my plan?
                    <ChevronDownIcon className="ml-4 h-5 w-5 transition-transform" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="rounded-lg bg-gray-100 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    You can upgrade or downgrade your plan at any time by visiting your account settings. Any changes to
                    your plan will take effect at the start of your next billing cycle.
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4 text-left text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                    Do you offer discounts for non-profit organizations?
                    <ChevronDownIcon className="ml-4 h-5 w-5 transition-transform" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="rounded-lg bg-gray-100 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Yes, we offer a 20% discount on all our plans for non-profit organizations. Please contact our sales
                    team for more information and to receive the discount.
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Contact Us</h2>
              <p className="mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions or need assistance? Our team is here to help.
              </p>
              <div className="mt-8 grid gap-6">
                <div>
                  <h3 className="text-xl font-semibold">Phone</h3>
                  <p className="text-gray-500 dark:text-gray-400">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Email</h3>
                  <p className="text-gray-500 dark:text-gray-400">support@example.com</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Address</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    123 Main Street
                    <br />
                    Anytown, USA 12345
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Get in Touch</h2>
              <p className="mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Fill out the form below, and we&apos;ll get back to you as soon as possible.
              </p>
              <form className="mt-8 grid gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" type="text" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="your@email.com" required type="email" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" rows={4} />
                </div>
                <Button className="w-full" type="submit">
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section> */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 EmoteMaker.ai All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Blog
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Resources
          </Link>
        </nav>
      </footer>
    </div>
  )
}
