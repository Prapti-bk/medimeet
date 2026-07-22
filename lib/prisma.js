import { PrismaClient } from "@prisma/client";

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2500;

const CONNECTION_ERRORS = new Set(["P1001", "P1002", "P1008", "P1017"]);

function isConnectionError(err) {
  return (
    CONNECTION_ERRORS.has(err?.code) ||
    /can't reach database|connection refused|econnrefused|socket hang up|etimedout|server has closed/i.test(
      err?.message ?? ""
    )
  );
}

function makePrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// ── Singleton ──────────────────────────────────────────────────────────────
// We store the raw PrismaClient on globalThis so hot-reloads in dev reuse it.
// On connection failure we replace it with a fresh instance.
if (!globalThis.__prisma) {
  globalThis.__prisma = makePrismaClient();
}

export function getDb() {
  return globalThis.__prisma;
}

// Convenience proxy so existing code using `db.xxx` keeps working unchanged.
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      return globalThis.__prisma[prop];
    },
  }
);

// ── withDb — retry wrapper ─────────────────────────────────────────────────
// Use this for any query that must survive a Neon cold-start:
//   const result = await withDb(db => db.user.findUnique({ where: { id } }))
//
// All existing code that calls `db.xxx` directly will also benefit because
// the connect_timeout=10 in the URL gives Neon 10 s to wake before Prisma
// gives up, which covers most cold-starts without needing explicit retries.
export async function withDb(fn) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn(globalThis.__prisma);
    } catch (err) {
      lastError = err;

      if (!isConnectionError(err) || attempt === MAX_RETRIES) {
        throw err;
      }

      console.warn(
        `[Prisma] Connection error (attempt ${attempt}/${MAX_RETRIES}, ` +
          `code=${err?.code ?? "?"}) — replacing client and retrying in ${RETRY_DELAY_MS}ms…`
      );

      // Tear down the dead client and create a fresh one
      try {
        await globalThis.__prisma.$disconnect();
      } catch {}
      globalThis.__prisma = makePrismaClient();

      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  throw lastError;
}
