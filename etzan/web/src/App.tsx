import { Suspense, lazy } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { BrainCircuit, Info, LayoutDashboard, Moon, ScanLine } from "lucide-react";
import { useLanguage } from "./lib/i18n";
import type { Language } from "./lib/i18n";

// Routes are split so a visitor landing on "/" does not download recharts (used
// only by the sleep and dashboard routes) before anything renders.
const Landing = lazy(() => import("./pages/Landing"));
const BrainCheck = lazy(() => import("./pages/BrainCheck"));
const SleepCheck = lazy(() => import("./pages/SleepCheck"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));

const TEAM = ["محمد المالكي", "عبدالرحمن القرشي", "غدي ال دعبش", "ليان الشدوخي"];

function LanguageToggle(): JSX.Element {
  const { lang, setLang, t } = useLanguage();
  const options: { value: Language; labelKey: "nav.switchToArabic" | "nav.switchToEnglish" }[] = [
    { value: "ar", labelKey: "nav.switchToArabic" },
    { value: "en", labelKey: "nav.switchToEnglish" },
  ];

  return (
    <div className="lang-toggle" role="group" aria-label={t("nav.languageLabel")}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          lang={option.value}
          aria-pressed={lang === option.value}
          className={lang === option.value ? "lang-option lang-option-active" : "lang-option"}
          onClick={() => setLang(option.value)}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}

function Nav(): JSX.Element {
  const { t } = useLanguage();
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <nav className="site-nav">
      {/* Wraps rather than overflowing: the logo, four links and the language
          toggle do not fit on one row at 375px, which pushed the whole page into
          horizontal scroll. */}
      <div className="container site-nav-inner">
        <NavLink to="/" className="brand">
          <BrainCircuit size={30} color="var(--peach-deep)" strokeWidth={2.2} />
          <span className="brand-name">{t("brand.name")}</span>
        </NavLink>
        <NavLink to="/brain" className={linkClass}>
          <ScanLine size={18} /> {t("nav.brain")}
        </NavLink>
        <NavLink to="/sleep" className={linkClass}>
          <Moon size={18} /> {t("nav.sleep")}
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={18} /> {t("nav.dashboard")}
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          <Info size={18} /> {t("nav.about")}
        </NavLink>
        <LanguageToggle />
      </div>
    </nav>
  );
}

export default function App(): JSX.Element {
  const { t } = useLanguage();
  return (
    <>
      <Nav />
      <main style={{ paddingBottom: "4rem" }}>
        <Suspense fallback={<div className="container" style={{ paddingTop: "3rem", minHeight: "50vh" }} />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/brain" element={<BrainCheck />} />
          <Route path="/sleep" element={<SleepCheck />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Landing />} />
        </Routes>
        </Suspense>
      </main>
      <footer
        className="container"
        style={{ textAlign: "center", color: "var(--cocoa-soft)", padding: "2rem 0 3rem", fontSize: "0.92rem" }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
          <BrainCircuit size={18} color="var(--peach-deep)" />
          <strong style={{ fontFamily: "var(--serif)" }}>{t("brand.name")}</strong>
        </div>
        <div style={{ marginBottom: "0.6rem" }}>{t("landing.privacyNote")}</div>
        <div style={{ display: "flex", gap: "0.5rem 1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {TEAM.map((name) => (
            <span key={name} lang="ar">{name}</span>
          ))}
        </div>
      </footer>
    </>
  );
}
