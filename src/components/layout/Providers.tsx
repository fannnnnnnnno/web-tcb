"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/LoadingComponents";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        themes={["dark", "light"]}
      >
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
