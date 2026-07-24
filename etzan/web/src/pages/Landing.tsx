import { Link } from "react-router-dom";
import {
  Activity, BedDouble, BrainCircuit, LayoutDashboard, ScanLine, Smartphone, TrendingDown, Users,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { MessageKey } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";

const EDA_FACTS: { icon: JSX.Element; statKey: MessageKey; textKey: MessageKey }[] = [
  { icon: <TrendingDown size={26} color="var(--blush-deep)" />, statKey: "landing.fact1.stat", textKey: "landing.fact1.text" },
  { icon: <Users size={26} color="var(--blush-deep)" />, statKey: "landing.fact2.stat", textKey: "landing.fact2.text" },
  { icon: <Smartphone size={26} color="var(--blush-deep)" />, statKey: "landing.fact3.stat", textKey: "landing.fact3.text" },
  { icon: <Activity size={26} color="var(--blush-deep)" />, statKey: "landing.fact4.stat", textKey: "landing.fact4.text" },
];

const SECTIONS: { to: string; titleKey: MessageKey; bodyKey: MessageKey; color: string; icon: JSX.Element }[] = [
  { to: "/brain", titleKey: "landing.brain.title", bodyKey: "landing.brain.body", color: "var(--peach)", icon: <ScanLine size={26} color="#fff" /> },
  { to: "/sleep", titleKey: "landing.sleep.title", bodyKey: "landing.sleep.body", color: "var(--sage)", icon: <BedDouble size={26} color="#fff" /> },
  { to: "/dashboard", titleKey: "landing.dashboard.title", bodyKey: "landing.dashboard.body", color: "var(--butter)", icon: <LayoutDashboard size={26} color="#fff" /> },
];

export default function Landing(): JSX.Element {
  const { t } = useLanguage();
  usePageMeta("meta.home.title", "meta.home.description");

  return (
    <div className="container">
      <section style={{ padding: "3rem 0 2rem", textAlign: "center" }}>
        <BrainCircuit size={64} color="var(--peach-deep)" strokeWidth={2} style={{ marginBottom: "0.5rem" }} />
        <h1>
          <span className="wavy">{t("landing.title")}</span> {t("landing.titleRest")}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--cocoa-soft)", maxWidth: 640, margin: "1.2rem auto" }}>
          {t("landing.intro")}
        </p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/brain" className="btn">{t("landing.ctaStart")}</Link>
          <Link to="/dashboard" className="btn btn-ghost">{t("landing.ctaDashboard")}</Link>
        </div>
      </section>

      <section style={{ margin: "1rem 0 3rem" }}>
        <h2 style={{ textAlign: "center" }}>{t("landing.factsTitle")}</h2>
        <p style={{ textAlign: "center", color: "var(--cocoa-soft)", marginBottom: "1.5rem", maxWidth: 620, marginInline: "auto" }}>
          {t("landing.factsSubtitle")}
        </p>
        <div className="grid grid-2">
          {EDA_FACTS.map((fact) => (
            <div key={fact.statKey} className="card" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {fact.icon}
              <div>
                <div className="c-blush" style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 700 }}>
                  {t(fact.statKey)}
                </div>
                <p style={{ margin: "0.2rem 0 0" }}>{t(fact.textKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <div className="grid grid-2">
          {SECTIONS.map((section) => (
            <Link key={section.to} to={section.to} className="card" style={{ display: "block" }}>
              <div className="blob" style={{ width: 52, height: 52, background: section.color, marginBottom: "0.8rem", display: "grid", placeItems: "center" }}>
                {section.icon}
              </div>
              <h3 style={{ fontFamily: "var(--serif)" }}>{t(section.titleKey)}</h3>
              <p style={{ margin: 0, color: "var(--cocoa-soft)" }}>{t(section.bodyKey)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
