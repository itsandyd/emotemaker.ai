import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerificationSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Email Verified!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for verifying your email address. You can now access all features of EmoteMaker.ai.
        </p>
        <div className="mt-6">
          <Link href="/emotes">
            <Button>Start Creating Emotes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 