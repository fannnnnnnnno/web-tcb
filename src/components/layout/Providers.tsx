"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/LoadingComponents";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
