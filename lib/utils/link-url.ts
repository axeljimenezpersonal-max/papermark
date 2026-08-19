export function constructLinkUrl(link: {
  id: string;
  domainId?: string | null;
  domainSlug?: string | null;
  slug?: string | null;
}) {
  if (link.domainId && link.domainSlug && link.slug) {
    return `https://${link.domainSlug}/${link.slug}`;
  }

  return `${process.env.NEXT_PUBLIC_BASE_URL}/view/${link.id}`;
}


