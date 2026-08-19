import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

import { TeamProvider } from "@/context/team-context";
import { UploadProgressProvider } from "@/context/upload-progress-context";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { EXCLUDED_PATHS } from "@/lib/constants";

import { PostHogCustomProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps<{ session: Session }>) {
  return (
    <>
      <Head>
        <title>Bóveda SINAPSYS</title>
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Bóveda de documentos privados de SINAPSYS: acceso identificado, marca de agua y registro de cada consulta."
          key="description"
        />
        <meta
          property="og:title"
          content="Bóveda SINAPSYS"
          key="og-title"
        />
        <meta
          property="og:description"
          content="Bóveda de documentos privados de SINAPSYS: acceso identificado, marca de agua y registro de cada consulta."
          key="og-description"
        />
        <meta
          property="og:image"
          content="https://sinapsys.mx/_static/meta-image.png"
          key="og-image"
        />
        <meta
          property="og:url"
          content="https://sinapsys.mx"
          key="og-url"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sinapsys" />
        <meta name="twitter:creator" content="@sinapsys" />
        <meta name="twitter:title" content="Papermark" key="tw-title" />
        <meta
          name="twitter:description"
          content="Bóveda de documentos privados de SINAPSYS: acceso identificado, marca de agua y registro de cada consulta."
          key="tw-description"
        />
        <meta
          name="twitter:image"
          content="https://sinapsys.mx/_static/meta-image.png"
          key="tw-image"
        />
        <link rel="icon" href="/favicon.ico" key="favicon" />
      </Head>
      <SessionProvider session={session}>
        <PostHogCustomProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <NuqsAdapter>
              <main className={inter.className}>
                <Toaster closeButton />
                <TooltipProvider delayDuration={100}>
                  {EXCLUDED_PATHS.includes(router.pathname) ? (
                    <Component {...pageProps} />
                  ) : (
                    <TeamProvider>
                      <UploadProgressProvider>
                        <Component {...pageProps} />
                      </UploadProgressProvider>
                    </TeamProvider>
                  )}
                </TooltipProvider>
              </main>
            </NuqsAdapter>
          </ThemeProvider>
        </PostHogCustomProvider>
      </SessionProvider>
    </>
  );
}
