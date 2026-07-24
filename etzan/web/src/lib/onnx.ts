// wasm-only build (no WebGPU/JSEP) — the "bundle" variant inlines the JS glue,
// so we only override the .wasm binary path and it runs fully offline (no CDN).
import * as ort from "onnxruntime-web/wasm";
import wasmSimdThreaded from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

ort.env.wasm.wasmPaths = { wasm: wasmSimdThreaded };
ort.env.wasm.numThreads = 1; // single-thread avoids COOP/COEP requirements on Pages
ort.env.wasm.proxy = false;

export interface ModelMeta {
  kind: "classifier" | "regressor";
  encoding: "direct" | "get_dummies";
  feature_order?: string[];
  raw_feature_columns?: string[];
  categorical_columns?: string[];
  dummy_columns?: string[];
  categorical_vocab?: Record<string, string[]>;
  control_columns?: string[];
  defaults?: Record<string, number>;
  duration_sweep?: { start: number; stop: number; step: number };
  classes?: (string | number)[];
  positive_index?: number;
  algo?: string;
}

interface LoadedModel {
  session: ort.InferenceSession;
  meta: ModelMeta;
}

const BASE = import.meta.env.BASE_URL;
const cache = new Map<string, Promise<LoadedModel>>();

async function fetchMeta(name: string): Promise<ModelMeta> {
  const res = await fetch(`${BASE}models/${name}.meta.json`);
  if (!res.ok) throw new Error(`meta ${name} ${res.status}`);
  return (await res.json()) as ModelMeta;
}

// Lazily load + cache an ONNX model and its metadata (per process).
export function loadModel(name: string): Promise<LoadedModel> {
  const existing = cache.get(name);
  if (existing) return existing;
  const promise = (async () => {
    const [session, meta] = await Promise.all([
      ort.InferenceSession.create(`${BASE}models/${name}.onnx`, {
        executionProviders: ["wasm"],
      }),
      fetchMeta(name),
    ]);
    return { session, meta };
  })();
  cache.set(name, promise);
  return promise;
}

async function run(model: LoadedModel, vector: number[]): Promise<ort.InferenceSession.OnnxValueMapType> {
  const input = new ort.Tensor("float32", Float32Array.from(vector), [1, vector.length]);
  return model.session.run({ input });
}

// Probability of the positive class (binary) or the full class-probability row.
export async function predictProba(name: string, vector: number[]): Promise<number[]> {
  const model = await loadModel(name);
  const outputs = await run(model, vector);
  // zipmap=False -> second output holds probabilities
  const probaKey = model.session.outputNames[1] ?? model.session.outputNames[0];
  const data = outputs[probaKey].data as Float32Array;
  return Array.from(data);
}

export async function predictValue(name: string, vector: number[]): Promise<number> {
  const model = await loadModel(name);
  const outputs = await run(model, vector);
  const key = model.session.outputNames[0];
  return (outputs[key].data as Float32Array)[0];
}

// Batched regression (used by the bedtime duration sweep).
export async function predictValues(name: string, rows: number[][]): Promise<number[]> {
  const model = await loadModel(name);
  const flat = Float32Array.from(rows.flat());
  const input = new ort.Tensor("float32", flat, [rows.length, rows[0].length]);
  const outputs = await model.session.run({ input });
  const key = model.session.outputNames[0];
  return Array.from(outputs[key].data as Float32Array);
}

export function getMeta(name: string): Promise<ModelMeta> {
  return loadModel(name).then((m) => m.meta);
}
