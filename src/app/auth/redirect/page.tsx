
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTideCloak } from "@tidecloak/nextjs";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { authenticated, isInitializing } = useTideCloak();

  useEffect(() => {
    if (isInitializing) return;

    // Return to the home page after auth state is resolved.
    // The home page displays the dashboard when authenticated.
    router.replace("/");
  }, [isInitializing, authenticated, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7]">
      <p className="text-sm text-[#65766f]">
        Completing sign-in...
      </p>
    </main>
  );
}
