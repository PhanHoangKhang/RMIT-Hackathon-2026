"use client";

import { useAuthCallback } from "@tidecloak/nextjs";
import { useEffect, useState } from "react";

// Logic is the Tide scaffold's, unchanged: useAuthCallback is what exchanges TideCloak's ?code= for
// tokens. Without it the browser lands on "/" with no session and login silently loops.
// Separated so useAuthCallback only runs after hydration (avoids SSR window error).
function RedirectHandler() {
  const { isProcessing, isSuccess, error } = useAuthCallback({
    onSuccess: (returnUrl) => {
      window.location.assign(returnUrl || "/");
    },
    onError: () => {
      window.location.assign("/");
    },
    onMissingVerifierRedirectTo: "/",
  });

  useEffect(() => {
    // If this page is loaded without callback params (direct navigation),
    // redirect to home.
    const params = new URLSearchParams(window.location.search);
    if (!params.has("code") && !params.has("error")) {
      window.location.assign("/");
    }
  }, []);

  if (error) {
    return <Shell tone="error">Authentication failed: {error.message}</Shell>;
  }

  if (isProcessing || !isSuccess) {
    return <Shell spinner>Completing sign-in...</Shell>;
  }

  return <Shell spinner>Redirecting...</Shell>;
}

function Shell({ children, spinner, tone }: { children: React.ReactNode; spinner?: boolean; tone?: "error" }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-5">
      <div className={`flex items-center gap-3 text-sm ${tone === "error" ? "text-[#c25e43]" : "text-[#65766f]"}`}>
        {spinner && <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#dce7e2] border-t-[#1d6353]" />}
        {children}
      </div>
    </main>
  );
}

export default function AuthRedirectPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Shell spinner>Loading...</Shell>;
  return <RedirectHandler />;
}
