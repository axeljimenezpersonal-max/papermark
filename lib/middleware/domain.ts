import { NextRequest, NextResponse } from "next/server";

import { BLOCKED_PATHNAMES } from "@/lib/constants";
import { getDomainRedirectUrl } from "@/lib/api/domains/redis";

export default async function DomainMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const host = req.headers.get("host");

  // If it's the root path, check for a configured redirect URL in Redis
  if (path === "/") {
    if (host) {
      const redirectUrl = await getDomainRedirectUrl(host);
      if (redirectUrl) {
        // 302: intentionally non-permanent since the target is user-configurable
        return NextResponse.redirect(new URL(redirectUrl, req.url), {
          status: 302,
        });
      }
    }

    // Parche self-host: al no reconocer un dominio, esto mandaba al visitante
    // a la web de Papermark — o sea, sacaba al cliente de la bóveda y lo
    // depositaba en la competencia. Ahora se queda en el sitio propio.
    return NextResponse.redirect(
      new URL(
        process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://sinapsys.mx",
        req.url,
      ),
    );
  }

  const url = req.nextUrl.clone();

  // Check for blocked pathnames
  if (BLOCKED_PATHNAMES.includes(path) || path.includes(".")) {
    url.pathname = "/404";
    return NextResponse.rewrite(url, { status: 404 });
  }

  // Rewrite the URL to the correct page component for custom domains
  // Rewrite to the pages/view/domains/[domain]/[slug] route
  url.pathname = `/view/domains/${host}${path}`;

  return NextResponse.rewrite(url, {
    headers: {
      "X-Robots-Tag": "noindex",
      "X-Powered-By":
        "Papermark - Secure Data Room Infrastructure for the modern web",
    },
  });
}
