'use client'

import { SignUp, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (signUp?.status === "complete") {
      router.push('/verification-pending');
    }
  }, [signUp?.status, isLoaded, router]);

  return <SignUp routing="path" path="/sign-up" />;
}