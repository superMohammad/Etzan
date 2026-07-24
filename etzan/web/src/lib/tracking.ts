import { brainBalance0to100, sleepBalance0to100 } from "./scoring";
import type { DailyLog, ScoredDay } from "./types";

const STORAGE_KEY = "etzan_daily_logs";

export function scoreDay(log: DailyLog): ScoredDay {
  const brainScore = brainBalance0to100(
    log.screen_time_hrs,
    log.social_media_hours,
    log.compulsive_use,
    log.stress
  );
  const sleepScore = sleepBalance0to100(
    log.sleep_hours,
    log.stress,
    log.caffeine_mg,
    log.exercise,
    log.felt_rested
  );
  const balance = Math.round(((brainScore + sleepScore) / 2) * 10) / 10;
  return { ...log, brainScore, sleepScore, balance };
}

export function loadLogs(): DailyLog[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DailyLog[];
    return parsed.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export function saveLog(log: DailyLog): DailyLog[] {
  const logs = loadLogs().filter((entry) => entry.date !== log.date);
  const next = [...logs, log].sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function scoredLogs(): ScoredDay[] {
  return loadLogs().map(scoreDay);
}

// --- Backup file export / import (no database) ----------------------------- //

export function exportJson(): void {
  const blob = new Blob([JSON.stringify(loadLogs(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `etzan-logs-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJson(file: File): Promise<DailyLog[]> {
  const text = await file.text();
  const incoming = JSON.parse(text) as DailyLog[];
  if (!Array.isArray(incoming)) throw new Error("ملف غير صالح");
  const byDate = new Map<string, DailyLog>();
  for (const entry of [...loadLogs(), ...incoming]) byDate.set(entry.date, entry);
  const merged = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
