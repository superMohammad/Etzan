import { AlertTriangle, Database, Lock, Ruler } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { MessageKey } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import { LEVEL_KEY } from "../lib/scoring";
import type { Level } from "../lib/scoring";
import { formatNumber } from "../lib/format";
import { Num } from "../components/ui";

const TEAM = ["محمد المالكي", "عبدالرحمن القرشي", "غدي ال دعبش", "ليان الشدوخي"];

// Measured on the held-out test set by etzan/export/export_onnx.py. Every
// estimator there is seeded with RANDOM_STATE, so these are reproducible rather
// than approximate — and they are the SHIPPED numbers, not the notebook
// baselines, which come from a different pipeline.
const MODELS: {
  nameKey: MessageKey;
  algorithm: string;
  metricKey: MessageKey;
  value: number;
  decimals: number;
}[] = [
  { nameKey: "about.model.brainRot", algorithm: "Logistic Regression", metricKey: "about.metric.auc", value: 0.856, decimals: 3 },
  { nameKey: "about.model.mentalHealth", algorithm: "Gradient Boosting", metricKey: "about.metric.auc", value: 0.811, decimals: 3 },
  { nameKey: "about.model.sleepQuality", algorithm: "Random Forest", metricKey: "about.metric.r2", value: 0.819, decimals: 3 },
  { nameKey: "about.model.disorder", algorithm: "Random Forest", metricKey: "about.metric.acc", value: 0.865, decimals: 3 },
  { nameKey: "about.model.feltRested", algorithm: "Logistic Regression", metricKey: "about.metric.auc", value: 0.809, decimals: 3 },
  { nameKey: "about.model.bedtime", algorithm: "Random Forest", metricKey: "about.metric.r2", value: 0.756, decimals: 3 },
];

const LEVEL_EXPLAINERS: { level: Level; key: MessageKey }[] = [
  { level: 1, key: "about.levels.1" },
  { level: 2, key: "about.levels.2" },
  { level: 3, key: "about.levels.3" },
  { level: 4, key: "about.levels.4" },
  { level: 5, key: "about.levels.5" },
];

export default function About(): JSX.Element {
  const { lang, t } = useLanguage();
  usePageMeta("meta.about.title", "meta.about.description");

  return (
    <div className="container prose" style={{ maxWidth: 760, paddingTop: "2rem" }}>
      <h1>{t("about.pageTitle")}</h1>
      <p style={{ fontSize: "1.1rem", color: "var(--cocoa-soft)" }}>{t("about.intro")}</p>

      <section className="card" style={{ marginTop: "1.5rem" }}>
        <h2>{t("about.whatTitle")}</h2>
        <p>{t("about.whatBody")}</p>
      </section>

      <section className="card" style={{ marginTop: "1.2rem" }}>
        <h2>
          <Database size={22} color="var(--peach-deep)" style={{ verticalAlign: "-3px", marginInlineEnd: "0.4rem" }} />
          {t("about.dataTitle")}
        </h2>
        <ul>
          <li>{t("about.dataQuestionnaire")}</li>
          <li>{t("about.dataSleep")}</li>
        </ul>
        <p style={{ marginBottom: 0 }}>{t("about.dataNote")}</p>
      </section>

      <section className="card" style={{ marginTop: "1.2rem" }}>
        <h2>{t("about.modelsTitle")}</h2>
        <p>{t("about.modelsIntro")}</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("about.table.model")}</th>
                <th scope="col">{t("about.table.algo")}</th>
                <th scope="col">{t("about.table.metric")}</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((model) => (
                <tr key={model.nameKey}>
                  <td>{t(model.nameKey)}</td>
                  <td><bdi className="num">{model.algorithm}</bdi></td>
                  <td>
                    <Num>{t(model.metricKey, { value: formatNumber(lang, model.value, model.decimals) })}</Num>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginBottom: 0 }}>{t("about.modelsCaveat")}</p>
      </section>

      <section className="card" style={{ marginTop: "1.2rem" }}>
        <h2>
          <Ruler size={22} color="var(--peach-deep)" style={{ verticalAlign: "-3px", marginInlineEnd: "0.4rem" }} />
          {t("about.levelsTitle")}
        </h2>
        <p>{t("about.levelsIntro")}</p>
        <ul className="level-legend">
          {LEVEL_EXPLAINERS.map((item) => (
            <li key={item.level}>
              <span className={`level-chip bg-${item.level <= 2 ? "sage" : item.level === 3 ? "butter" : "blush"}`}>
                <Num>{formatNumber(lang, item.level, 0)}</Num>
              </span>
              <strong>{t(LEVEL_KEY[item.level])}</strong>
              <span>{t(item.key)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" style={{ marginTop: "1.2rem" }}>
        <h2>
          <Lock size={22} color="var(--peach-deep)" style={{ verticalAlign: "-3px", marginInlineEnd: "0.4rem" }} />
          {t("about.privacyTitle")}
        </h2>
        <p style={{ marginBottom: 0 }}>{t("about.privacyBody")}</p>
      </section>

      <section className="card bg-butter" style={{ marginTop: "1.2rem" }}>
        <h2>
          <AlertTriangle size={22} color="var(--cocoa)" style={{ verticalAlign: "-3px", marginInlineEnd: "0.4rem" }} />
          {t("about.disclaimerTitle")}
        </h2>
        <p style={{ marginBottom: 0 }}>{t("about.disclaimerBody")}</p>
      </section>

      <section className="card" style={{ marginTop: "1.2rem", marginBottom: "2rem" }}>
        <h2>{t("about.teamTitle")}</h2>
        <p>{t("about.teamBody")}</p>
        <ul className="team-list">
          {TEAM.map((name) => <li key={name} lang="ar">{name}</li>)}
        </ul>
      </section>
    </div>
  );
}
