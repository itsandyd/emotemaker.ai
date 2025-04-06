'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerificationPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="text-lg text-muted-foreground">
          We&apos;ve sent you a verification email. Please check your inbox and click the verification link to continue.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try signing up again.
          </p>
          <Button asChild>
            <Link href="/sign-up">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 