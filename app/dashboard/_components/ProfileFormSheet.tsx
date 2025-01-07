"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from '@clerk/nextjs'

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(160).optional(),
  twitch: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
})

export function ProfileFormDialog() {
  const [isOpen, setIsOpen] = useState(true)
  const { user } = useUser()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      twitch: "",
      youtube: "",
      instagram: "",
      twitter: "",
    },
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      await axios.post('/api/profile', {
        ...values,
        userId: user.id
      })
      
      toast.success('Profile updated successfully!')
      setIsOpen(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile.')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      toast.error("You must complete your profile before exiting.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 gap-0">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2.5">
            Please fill out your profile information to continue. Fields marked with an asterisk (*) are required.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>This field is required.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself" 
                        className="px-4 py-3 min-h-[100px] transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Max 160 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitch (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Twitch username" 
                        className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your YouTube channel" 
                        className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Instagram handle" 
                        className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Twitter handle" 
                        className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save Profile</Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}