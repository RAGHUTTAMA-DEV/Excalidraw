const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const inflight = new Set<number>();
const buckets = new Map<number, { count: number; reset: number }>();

export function beginAgentRequest(userId: number): { ok: true } | { ok: false; status: number; message: string } {
  if (inflight.has(userId)) {
    return { ok: false, status: 429, message: "Already drawing that thought." };
  }
  const now = Date.now();
  const bucket = buckets.get(userId);
  if (!bucket || now > bucket.reset) {
    buckets.set(userId, { count: 1, reset: now + WINDOW_MS });
  } else if (bucket.count >= MAX_PER_WINDOW) {
    return { ok: false, status: 429, message: "Give the agent a minute — too many asks." };
  } else {
    bucket.count += 1;
  }
  inflight.add(userId);
  return { ok: true };
}

export function endAgentRequest(userId: number) {
  inflight.delete(userId);
}
