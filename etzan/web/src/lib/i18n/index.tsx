import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ar } from "./ar";
import { en } from "./en";
import type { MessageKey } from "./ar";

export type Language = "ar" | "en";
export type { MessageKey };

export interface Interpolations {
  [placeholder: string]: string | number;
}

export type Translate = (key: MessageKey, values?: Interpolations) => string;

const CATALOGUES: Record<Language, Record<MessageKey, string>> = { ar, en };
const DIRECTION: Record<Language, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };
const STORAGE_KEY = "etzan_language";
const DEFAULT_LANGUAGE: Language = "ar";

function isLanguage(value: string | null): value is Language {
  return value === "ar" || value === "en";
}

function storedLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}

// Replaces {name} placeholders. Deliberately not a template engine: keeping
// interpolation this dumb means every number still arrives pre-formatted from
// lib/format.ts rather than being stringified here with the wrong numerals.
function interpolate(template: string, values: Interpolations | undefined): string {
  if (values === undefined) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

interface LanguageContextValue {
  lang: Language;
  dir: "rtl" | "ltr";
  t: Translate;
  setLang: (next: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [lang, setLangState] = useState<Language>(storedLanguage);

  // The document element is the only place direction can live: it drives every
  // logical CSS property (margin-inline, borderInlineStart) the app relies on.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = DIRECTION[lang];
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: Language): void => {
    setLangState(next);
  }, []);

  const t = useCallback<Translate>(
    (key, values) => interpolate(CATALOGUES[lang][key], values),
    [lang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir: DIRECTION[lang], t, setLang }),
    [lang, t, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === null) throw new Error("useLanguage called outside LanguageProvider");
  return context;
}

// Convenience for the common case of only needing the lookup function.
export function useT(): Translate {
  return useLanguage().t;
}
