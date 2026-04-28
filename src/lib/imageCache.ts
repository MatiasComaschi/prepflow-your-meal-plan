import { generateRecipeImageServerFn } from "@/server/images";

const STORAGE_KEY = "prepflow:img-cache:v1";
const MAX_ENTRIES = 80;

type CacheMap = Record<string, string>;

let memCache: CacheMap | null = null;
const inflight = new Map<string, Promise<string>>();

function load(): CacheMap {
  if (memCache) return memCache;
  if (typeof window === "undefined") {
    memCache = {};
    return memCache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memCache = raw ? (JSON.parse(raw) as CacheMap) : {};
  } catch {
    memCache = {};
  }
  return memCache;
}

function persist() {
  if (typeof window === "undefined" || !memCache) return;
  try {
    // Trim to MAX_ENTRIES (drop oldest by insertion order)
    const entries = Object.entries(memCache);
    if (entries.length > MAX_ENTRIES) {
      memCache = Object.fromEntries(entries.slice(-MAX_ENTRIES));
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  } catch {
    // quota exceeded — drop half and retry once
    try {
      const entries = Object.entries(memCache!);
      memCache = Object.fromEntries(entries.slice(-Math.floor(MAX_ENTRIES / 2)));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
    } catch {
      /* ignore */
    }
  }
}

export function getCachedImage(key: string): string | null {
  return load()[key] ?? null;
}

export function buildRecipePrompt(name: string): string {
  return `professional food photography of ${name}, overhead shot, dark moody background, restaurant quality plating, natural lighting, 4k`;
}

export async function getOrGenerateRecipeImage(
  recipeId: string,
  recipeName: string,
): Promise<string> {
  const cache = load();
  if (cache[recipeId]) return cache[recipeId];

  const existing = inflight.get(recipeId);
  if (existing) return existing;

  const p = (async () => {
    const { url } = await generateRecipeImageServerFn({
      data: { prompt: buildRecipePrompt(recipeName) },
    });
    cache[recipeId] = url;
    persist();
    return url;
  })().finally(() => {
    inflight.delete(recipeId);
  });

  inflight.set(recipeId, p);
  return p;
}
