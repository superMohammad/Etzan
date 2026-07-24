import { useEffect } from "react";
import { useLanguage } from "./i18n";
import type { MessageKey } from "./i18n";

// Per-route document metadata. A single-page app ships one <title> and one
// description in index.html, so every route shared the same SERP entry and every
// shared link previewed identically. This sets them per route, in the active
// language, and keeps canonical/Open Graph in step.

const OG_LOCALE: Record<string, string> = { ar: "ar_SA", en: "en_US" };

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (tag === null) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link === null) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function usePageMeta(titleKey: MessageKey, descriptionKey: MessageKey): void {
  const { lang, t } = useLanguage();

  useEffect(() => {
    const title = t(titleKey);
    const description = t(descriptionKey);
    const url = window.location.href.split("#")[0];

    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertCanonical(url);

    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", OG_LOCALE[lang]);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  }, [lang, t, titleKey, descriptionKey]);
}
