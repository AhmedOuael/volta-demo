"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useBrandHref } from "./BrandProvider";

/** next/link that keeps visitors inside the active brand (/p/<slug>) for internal string hrefs. */
export default function BrandLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const brandHref = useBrandHref();
  return <NextLink href={typeof href === "string" ? brandHref(href) : href} {...props} />;
}
