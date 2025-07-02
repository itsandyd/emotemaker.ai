"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TwitchIcon, YoutubeIcon, InstagramIcon, TwitterIcon } from "lucide-react"

const profileFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  bio: z.string().min(1, { message: "Bio is required" }),
  twitch: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
})

export default function ProfileForm() {
  const [isOpen, setIsOpen] = useState(true)

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      twitch: "",
      youtube: "",
      instagram: "",
      twitter: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      await axios.post('/api/profile', data)
      toast.success("Profile created successfully")
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to create profile")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Your Profile</SheetTitle>
          <SheetDescription>
            Please fill out your profile information to continue.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="twitch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TwitchIcon className="w-4 h-4" />
                    Twitch
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Twitch handle" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <YoutubeIcon className="w-4 h-4" />
                    YouTube
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your YouTube channel" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <InstagramIcon className="w-4 h-4" />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Instagram handle" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TwitterIcon className="w-4 h-4" />
                    Twitter
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Twitter handle" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Create Profile</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}