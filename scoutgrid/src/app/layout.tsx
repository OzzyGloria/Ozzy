"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <title>ScoutGrid — Football Intelligence Platform</title>
        <meta
          name="description"
          content="The global football scouting and intelligence platform. Get discovered by clubs worldwide."
        />
      </head>
      <body className="bg-navy text-white min-h-screen font-body antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#0D1426",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
