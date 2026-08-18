import { Metadata } from "next";

import EmailVerificationClient from "./page-client";

const data = {
  description: "Verificar acceso a la Bóveda SINAPSYS",
  title: "Verificar acceso | Bóveda SINAPSYS",
  url: "/auth/email",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vault.sinapsys.mx"),
  title: data.title,
  description: data.description,
  openGraph: {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: "Bóveda SINAPSYS",
    images: [
      {
        url: "/_static/meta-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    description: data.description,
    creator: "@sinapsys",
    images: ["/_static/meta-image.png"],
  },
};

export default async function EmailVerificationPage() {
  return <EmailVerificationClient />;
}
