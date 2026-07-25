import type { Language, MessageKey, Translate } from "./i18n";

// Single formatting layer for every number, date and count rendered in the UI.
//
// The app runs RTL in Arabic. Printing a bare number into RTL text lets the bidi
// algorithm reorder it against neighbouring punctuation ("40%" rendered as
// "%40", "1-10" rendered as "10-1"). Two rules keep that from happening:
//   1. Latin digits everywhere, produced through the "-u-nu-latn" locale
//      extension so no Arabic-Indic digit ever enters a mixed-direction run.
//   2. Every formatted value is rendered inside <bdi> (see <Num> in ui.tsx),
//      which isolates it from the surrounding paragraph direction.
// The Gregorian calendar is forced for Arabic too: plain "ar"/"ar-SA" resolves
// to islamic-umalqura in some environments, which would not match the ISO dates
// stored in localStorage.

const NUMBER_LOCALE: Record<Language, string> = {
  ar: "ar-u-nu-latn",
  en: "en",
};

const DATE_LOCALE: Record<Language, string> = {
  ar: "ar-u-nu-latn-ca-gregory",
  en: "en-GB",
};

const pluralRules: Record<Language, Intl.PluralRules> = {
  ar: new Intl.PluralRules("ar"),
  en: new Intl.PluralRules("en"),
};

export function formatNumber(lang: Language, value: number, decimals: number): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// A 0-1 fraction as a whole-percent string, e.g. 0.4 -> "40%".
export function formatPercent(lang: Language, fraction: number): string {
  return `${formatNumber(lang, fraction * 100, 0)}%`;
}

// "2026-07-25" -> "25 يوليو 2026" / "25 July 2026"
export function formatDateLong(lang: Language, isoDate: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], { dateStyle: "long" }).format(parseIso(isoDate));
}

// "2026-07-25" -> "25 يوليو" / "25 Jul" — for chart ticks, where the year is noise.
export function formatDateShort(lang: Language, isoDate: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], { day: "numeric", month: "short" }).format(
    parseIso(isoDate)
  );
}

function parseIso(isoDate: string): Date {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ISO date '${isoDate}'`);
  return parsed;
}

// Arabic inflects the noun differently at 1, 2, 3-10, 11-99 and 100+, so
// "{n} يوم" is wrong for most values. Intl.PluralRules picks the category and
// the catalogue supplies the matching wording; English collapses to one/other
// but goes through the same path rather than special-casing at each call site.
function pluralKey(
  prefix: "days" | "daysLogged" | "hours" | "minutes",
  lang: Language,
  count: number
): MessageKey {
  return `${prefix}.${pluralRules[lang].select(count)}` as MessageKey;
}

// "7 أيام" / "30 يومًا" / "7 days"
export function formatDays(lang: Language, t: Translate, count: number): string {
  return t(pluralKey("days", lang, count), { count: formatNumber(lang, count, 0) });
}

// "يومان مسجّلان" / "2 days logged"
export function formatDaysLogged(lang: Language, t: Translate, count: number): string {
  return t(pluralKey("daysLogged", lang, count), { count: formatNumber(lang, count, 0) });
}

// The bedtime sweep steps in quarter hours, so a decimal rendering turned 8.75
// into "8.8 hours" — a duration nobody can act on. Split it into whole units.
function splitDuration(decimalHours: number): { hours: number; minutes: number } {
  const total = Math.round(decimalHours * 60);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

// "8 ساعات و45 دقيقة" / "8 hours 45 minutes". Falls back to the hours alone on
// an exact hour rather than printing "8 hours 0 minutes".
export function formatDuration(lang: Language, t: Translate, decimalHours: number): string {
  const { hours, minutes } = splitDuration(decimalHours);
  const hoursText = t(pluralKey("hours", lang, hours), { count: formatNumber(lang, hours, 0) });
  if (minutes === 0) return hoursText;
  const minutesText = t(pluralKey("minutes", lang, minutes), { count: formatNumber(lang, minutes, 0) });
  return t("duration.hoursAndMinutes", { hours: hoursText, minutes: minutesText });
}

// Compact, Latin-only form for the illustration's arc label. That string shares
// an LTR SVG run with the two clock times and has about 240px to fit, so it
// stays free of Arabic letters that would need their own bidi handling; the
// full natural-language duration is stated in the sentence directly below it.
export function formatDurationShort(decimalHours: number): string {
  const { hours, minutes } = splitDuration(decimalHours);
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

// An inclusive numeric range for a field label, e.g. "1–10". Render inside <bdi>.
export function formatRange(lang: Language, min: number, max: number): string {
  return `${formatNumber(lang, min, 0)}–${formatNumber(lang, max, 0)}`;
}
