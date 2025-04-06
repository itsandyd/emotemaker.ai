'use client'

import { SignUp, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();

  useEffect(() => {
    const handleSignUp = async () => {
      if (signUp?.status === "complete") {
        // Get the user's email and name
        const email = signUp.emailAddress;
        const name = signUp.firstName || "User";
        const userId = signUp.createdUserId;

        if (email && userId) {
          try {
            // Call our API to handle ActiveCampaign verification
            const response = await fetch('/api/auth/verify-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name,
                userId,
                verificationUrl: `${window.location.origin}/verify?token=${userId}`
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to initiate verification');
            }

            // Redirect to verification pending page
            router.push('/verification-pending');
          } catch (error) {
            console.error('Error initiating verification:', error);
          }
        }
      }
    };

    handleSignUp();
  }, [signUp?.status, signUp?.emailAddress, signUp?.firstName, signUp?.createdUserId, router]);

  return <SignUp routing="path" path="/sign-up" afterSignUpUrl="/verification-pending" />;
}