#!/usr/bin/env node


const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const DEFAULT_API_BASE = "http://localhost:8080";
const DEFAULT_WEB_BASE = "http://localhost:3000";
const REPORT_DIR = path.join(__dirname, "reports");
const API_PREFIX = "/api/v1";

const PUBLIC_API_ROUTES = [
  { name: "Health - Actuator", method: "GET", path: "/actuator/health", ok: [200] },
  { name: "System status", method: "GET", path: `${API_PREFIX}/system/status`, ok: [200] },
  { name: "Movies list", method: "GET", path: `${API_PREFIX}/movies`, ok: [200] },
  { name: "Movie categories", method: "GET", path: `${API_PREFIX}/movies/categories`, ok: [200] },
  { name: "Movie persons", method: "GET", path: `${API_PREFIX}/movies/persons`, ok: [200] },
  { name: "Movie studios", method: "GET", path: `${API_PREFIX}/movies/studios`, ok: [200] },
  { name: "Movie by id", method: "GET", path: `${API_PREFIX}/movies/1`, ok: [200, 404] },
  {
    name: "Movie episodes",
    method: "GET",
    path: `${API_PREFIX}/movies/1/episodes`,
    ok: [200, 404],
  },
  { name: "Movie tags", method: "GET", path: `${API_PREFIX}/movies/1/tags`, ok: [200, 404] },
  {
    name: "Movie categories by movie",
    method: "GET",
    path: `${API_PREFIX}/movies/1/categories`,
    ok: [200, 404],
  },
  {
    name: "Movie detail aggregate by slug",
    method: "GET",
    path: `${API_PREFIX}/movies/slug/test/detail`,
    ok: [200, 404],
  },
  {
    name: "Movies search",
    method: "POST",
    path: `${API_PREFIX}/movies/search`,
    body: { keyword: "a" },
    ok: [200],
  },
  {
    name: "Movies advanced search",
    method: "POST",
    path: `${API_PREFIX}/movies/search/advanced`,
    body: { keyword: "a" },
    ok: [200],
  },
  {
    name: "Subscriptions plans",
    method: "GET",
    path: `${API_PREFIX}/subscriptions/plans`,
    ok: [200],
  },
  {
    name: "Advertisements active",
    method: "GET",
    path: `${API_PREFIX}/advertisements/active`,
    ok: [200],
  },
  { name: "Ads public", method: "GET", path: `${API_PREFIX}/ads`, ok: [200, 404] },
  {
    name: "Discovery weekly trending",
    method: "GET",
    path: `${API_PREFIX}/discovery/weekly-trending`,
    ok: [200],
  },
  {
    name: "Discovery popular",
    method: "GET",
    path: `${API_PREFIX}/discovery/popular`,
    ok: [200, 404],
  },
  {
    name: "Discovery latest",
    method: "GET",
    path: `${API_PREFIX}/discovery/latest`,
    ok: [200, 404],
  },
  {
    name: "Comments by movie",
    method: "GET",
    path: `${API_PREFIX}/comments/movie/1`,
    ok: [200, 404],
  },
  {
    name: "Reviews by movie",
    method: "GET",
    path: `${API_PREFIX}/reviews/movie/1`,
    ok: [200, 404],
  },
  {
    name: "Reviews by movie page",
    method: "GET",
    path: `${API_PREFIX}/reviews/movie/1/page`,
    ok: [200, 404],
  },
  {
    name: "Search history public search",
    method: "GET",
    path: `${API_PREFIX}/search-histories/search?keyword=a`,
    ok: [200, 404],
  },
  {
    name: "Stream ad key",
    method: "GET",
    path: `${API_PREFIX}/stream/keys/ads/1`,
    ok: [200, 403, 404],
  },
  {
    name: "Stream key",
    method: "GET",
    path: `${API_PREFIX}/stream/keys/series/episodes/1/720p`,
    ok: [200, 403, 404],
  },
  {
    name: "Offline key",
    method: "GET",
    path: `${API_PREFIX}/stream/offline/key/1/720p`,
    ok: [200, 403, 404],
  },
];

const FRONTEND_ROUTES = [
  {
    name: "Home SSR shell",
    path: "/",
    csrApis: [`${API_PREFIX}/discovery/weekly-trending`, `${API_PREFIX}/movies`],
  },
  {
    name: "Movies SSR shell",
    path: "/movies",
    csrApis: [`${API_PREFIX}/movies`, `${API_PREFIX}/movies/categories`],
  },
  {
    name: "Discovery SSR shell",
    path: "/discovery",
    csrApis: [`${API_PREFIX}/discovery/weekly-trending`],
  },
  { name: "Pricing SSR shell", path: "/pricing", csrApis: [`${API_PREFIX}/subscriptions/plans`] },
  {
    name: "Watch CSR page",
    path: "/watch/test",
    csrApis: [`${API_PREFIX}/movies/slug/test/detail`],
  },
];

function parseArgs(argv) {
  loadDotEnv(path.join(process.cwd(), ".env"));
  loadDotEnv(path.join(process.cwd(), ".env.local"));

  const args = {
    api: process.env.API_BASE_URL || DEFAULT_API_BASE,
    web: process.env.WEB_BASE_URL || DEFAULT_WEB_BASE,
    runs: Number(process.env.RUNS || 3),
    concurrency: Number(process.env.CONCURRENCY || 3),
    lighthouse: process.env.LIGHTHOUSE === "1",
    redis: process.env.REDIS_URL || "",
    actuator: process.env.ACTUATOR_METRICS_URL || "",
    timeout: Number(process.env.TIMEOUT_MS || 15000),
    gatePassword: process.env.GATE_PASSWORD || "",
    gateCookie: process.env.GATE_COOKIE || "",
    useGate: process.env.USE_GATE !== "0",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--api") args.api = value;
    if (key === "--web") args.web = value;
    if (key === "--runs") args.runs = Number(value);
    if (key === "--concurrency") args.concurrency = Number(value);
    if (key === "--redis") args.redis = value;
    if (key === "--actuator") args.actuator = value;
    if (key === "--timeout") args.timeout = Number(value);
    if (key === "--gate-password") args.gatePassword = value;
    if (key === "--gate-cookie") args.gateCookie = value;
    if (key === "--lighthouse") args.lighthouse = true;
    if (key === "--no-lighthouse") args.lighthouse = false;
    if (key === "--no-gate") args.useGate = false;
    if (!key.startsWith("--")) continue;
    if (!["--lighthouse", "--no-lighthouse", "--no-gate"].includes(key)) i += 1;
  }

  args.api = trimSlash(args.api);
  args.web = trimSlash(args.web);
  return args;
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function round(value, digits = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}

async function timedFetch(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: "application/json,text/html,*/*",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const durationMs = performance.now() - started;
    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      bytes: Buffer.byteLength(text || "", "utf8"),
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: performance.now() - started,
      bytes: 0,
      headers: {},
      body: "",
      error: error?.message || String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runLimited(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, limit) }, worker));
  return results;
}

async function benchmarkApis(config) {
  const tasks = [];

  for (const route of PUBLIC_API_ROUTES) {
    for (let i = 0; i < config.runs; i += 1) {
      tasks.push(async () => {
        const url = `${config.api}${route.path}`;
        const options = {
          method: route.method,
          body: route.body ? JSON.stringify(route.body) : undefined,
        };
        const result = await timedFetch(url, options, config.timeout);
        return { route, url, ...result, accepted: route.ok.includes(result.status) };
      });
    }
  }

  const raw = await runLimited(tasks, config.concurrency);
  return PUBLIC_API_ROUTES.map((route) =>
    summarize(
      route.name,
      raw.filter((item) => item.route.name === route.name),
      route
    )
  );
}

function summarize(name, samples, route = {}) {
  const durations = samples.map((sample) => sample.durationMs).filter(Number.isFinite);
  const success = samples.filter((sample) => sample.accepted || sample.ok).length;
  const statuses = samples.reduce((acc, sample) => {
    acc[sample.status] = (acc[sample.status] || 0) + 1;
    return acc;
  }, {});
  const errors = samples.filter((sample) => sample.error).map((sample) => sample.error);

  return {
    name,
    method: route.method,
    path: route.path,
    expectedStatuses: route.ok,
    runs: samples.length,
    success,
    successRate: round((success / Math.max(1, samples.length)) * 100),
    statuses,
    avgMs: round(average(durations)),
    p50Ms: round(percentile(durations, 50)),
    p95Ms: round(percentile(durations, 95)),
    p99Ms: round(percentile(durations, 99)),
    minMs: round(Math.min(...durations)),
    maxMs: round(Math.max(...durations)),
    avgBytes: round(average(samples.map((sample) => sample.bytes))),
    errors: [...new Set(errors)].slice(0, 3),
  };
}

async function resolveGateCookie(config) {
  if (!config.useGate) return "";
  if (config.gateCookie) return config.gateCookie;
  if (!config.gatePassword) return "";

  const response = await timedFetch(
    `${config.web}/api/access/verify`,
    {
      method: "POST",
      body: JSON.stringify({ password: config.gatePassword }),
    },
    config.timeout
  );

  if (response.status !== 200) {
    return "";
  }

  return parseSetCookieHeader(response.headers["set-cookie"] || "");
}

function parseSetCookieHeader(setCookie) {
  const cookies = String(setCookie || "")
    .split(/,(?=\s*[^;=]+=[^;]+)/)
    .map((cookie) => cookie.split(";")[0].trim())
    .filter(Boolean);
  return cookies.join("; ");
}

async function benchmarkFrontend(config, gateCookie = "") {
  const rows = [];
  const gateHeaders = gateCookie ? { cookie: gateCookie } : {};

  for (const route of FRONTEND_ROUTES) {
    const documentSamples = [];
    const csrSamples = [];

    for (let i = 0; i < config.runs; i += 1) {
      const doc = await timedFetch(
        `${config.web}${route.path}`,
        { method: "GET", headers: gateHeaders },
        config.timeout
      );
      documentSamples.push({ ...doc, accepted: doc.status >= 200 && doc.status < 500 });

      const csrStart = performance.now();
      const apiResults = await runLimited(
        route.csrApis.map(
          (apiPath) => () =>
            timedFetch(`${config.api}${apiPath}`, { method: "GET" }, config.timeout)
        ),
        Math.min(route.csrApis.length || 1, config.concurrency)
      );
      csrSamples.push({
        ok: apiResults.every((item) => item.status >= 200 && item.status < 500),
        accepted: apiResults.every((item) => item.status >= 200 && item.status < 500),
        status: apiResults.map((item) => item.status).join(","),
        durationMs: performance.now() - csrStart,
        bytes: apiResults.reduce((sum, item) => sum + item.bytes, 0),
        error: apiResults
          .map((item) => item.error)
          .filter(Boolean)
          .join("; "),
      });
    }

    rows.push({
      route: route.name,
      path: route.path,
      gateMode: gateCookie ? "after-access-gate" : "without-access-gate-cookie",
      ssrDocument: summarize(`${route.name} document`, documentSamples),
      csrApis: route.csrApis,
      csrDataFetch: summarize(`${route.name} CSR APIs`, csrSamples),
      ssrVsCsrDeltaMs: round(
        average(csrSamples.map((s) => s.durationMs)) -
          average(documentSamples.map((s) => s.durationMs))
      ),
      seo: inspectSeo(documentSamples[0]?.body || "", `${config.web}${route.path}`),
    });
  }

  return rows;
}

function inspectSeo(html, url) {
  const title = matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = matchAttr(html, /<meta[^>]+name=["']description["'][^>]*>/i, "content");
  const canonical = matchAttr(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, "href");
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const robots = matchAttr(html, /<meta[^>]+name=["']robots["'][^>]*>/i, "content");

  return {
    url,
    title: title || null,
    titleLength: title.length,
    description: description || null,
    descriptionLength: description.length,
    canonical: canonical || null,
    h1Count,
    robots: robots || null,
    ok: Boolean(title) && Boolean(description) && h1Count <= 1,
  };
}

function matchContent(html, regex) {
  const match = html.match(regex);
  return match ? stripHtml(match[1]).trim() : "";
}

function matchAttr(html, tagRegex, attr) {
  const tag = html.match(tagRegex)?.[0] || "";
  const attrRegex = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  return tag.match(attrRegex)?.[1]?.trim() || "";
}

function stripHtml(value) {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ");
}

async function runLighthouse(config, gateCookie = "") {
  if (!config.lighthouse) {
    return {
      skipped: true,
      reason: "Pass --lighthouse to run Lighthouse. Install: npm i -D lighthouse chrome-launcher",
    };
  }

  let lighthouse;
  let chromeLauncher;
  try {
    lighthouse = (await import("lighthouse")).default;
    chromeLauncher = await import("chrome-launcher");
  } catch (error) {
    return {
      skipped: true,
      reason: `Missing dependency: ${error.message}. Run: npm i -D lighthouse chrome-launcher`,
    };
  }

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-extensions",
    ],
  });
  const results = [];
  const extraHeaders = gateCookie ? { Cookie: gateCookie } : undefined;

  try {
    for (const route of FRONTEND_ROUTES) {
      let runnerResult;

      try {
        runnerResult = await lighthouse(`${config.web}${route.path}`, {
          port: chrome.port,
          output: "json",
          logLevel: "error",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
          extraHeaders,
          maxWaitForLoad: 45000,
        });
      } catch (error) {
        results.push({
          route: route.name,
          path: route.path,
          url: `${config.web}${route.path}`,
          gateMode: gateCookie ? "after-access-gate" : "without-access-gate-cookie",
          error: error?.message || String(error),
        });
        continue;
      }
      const lhr = runnerResult.lhr;
      results.push({
        route: route.name,
        path: route.path,
        url: `${config.web}${route.path}`,
        gateMode: gateCookie ? "after-access-gate" : "without-access-gate-cookie",
        categories: Object.fromEntries(
          Object.entries(lhr.categories).map(([key, value]) => [
            key,
            round((value.score || 0) * 100, 0),
          ])
        ),
        metrics: {
          fcpMs: auditNumeric(lhr, "first-contentful-paint"),
          lcpMs: auditNumeric(lhr, "largest-contentful-paint"),
          tbtMs: auditNumeric(lhr, "total-blocking-time"),
          cls: auditNumeric(lhr, "cumulative-layout-shift"),
          speedIndexMs: auditNumeric(lhr, "speed-index"),
          ttiMs: auditNumeric(lhr, "interactive"),
        },
      });
    }
  } finally {
    await chrome.kill();
  }

  return results;
}

function auditNumeric(lhr, id) {
  return round(lhr.audits?.[id]?.numericValue || 0);
}

async function readRedisStats(config) {
  const fromRedis = await readRedisInfo(config.redis);
  const fromActuator = await readActuatorRedis(config.actuator, config.timeout);
  return (
    fromRedis ||
    fromActuator || {
      skipped: true,
      reason:
        "No Redis source configured. Use --redis redis:
    }
  );
}

async function readRedisInfo(redisUrl) {
  if (!redisUrl) return null;

  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl });
    await client.connect();
    const info = await client.info("stats");
    await client.quit();
    const stats = parseRedisInfo(info);
    return formatRedisStats("redis-info", stats);
  } catch (error) {
    return {
      skipped: true,
      source: "redis-info",
      reason: `Cannot read Redis INFO: ${error.message}. Install: npm i -D redis`,
    };
  }
}

async function readActuatorRedis(actuatorUrl, timeoutMs) {
  if (!actuatorUrl) return null;

  const base = trimSlash(actuatorUrl);
  const hits = await timedFetch(`${base}/cache.gets?tag=result:hit`, {}, timeoutMs);
  const misses = await timedFetch(`${base}/cache.gets?tag=result:miss`, {}, timeoutMs);

  if (hits.status !== 200 || misses.status !== 200) {
    return {
      skipped: true,
      source: "spring-actuator",
      reason: `Actuator metrics unavailable. hits=${hits.status}, misses=${misses.status}`,
    };
  }

  const hitCount = actuatorMetricValue(hits.body);
  const missCount = actuatorMetricValue(misses.body);
  return formatRedisStats("spring-actuator", {
    keyspace_hits: hitCount,
    keyspace_misses: missCount,
  });
}

function parseRedisInfo(info) {
  return String(info)
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const [key, value] = line.split(":");
      acc[key] = Number(value);
      return acc;
    }, {});
}

function actuatorMetricValue(body) {
  try {
    const data = JSON.parse(body);
    return Number(
      data.measurements?.find((item) => item.statistic === "COUNT" || item.statistic === "VALUE")
        ?.value || 0
    );
  } catch {
    return 0;
  }
}

function formatRedisStats(source, stats) {
  const hits = Number(stats.keyspace_hits || 0);
  const misses = Number(stats.keyspace_misses || 0);
  const total = hits + misses;
  return {
    source,
    hits,
    misses,
    total,
    hitRatio: total ? round((hits / total) * 100) : 0,
    missRatio: total ? round((misses / total) * 100) : 0,
  };
}

function printApiTable(title, rows) {
  console.log(`\n${title}`);
  console.table(
    rows.map((row) => ({
      name: row.name,
      path: row.path,
      successRate: `${row.successRate}%`,
      statuses: JSON.stringify(row.statuses),
      avgMs: row.avgMs,
      p95Ms: row.p95Ms,
      p99Ms: row.p99Ms,
      avgBytes: row.avgBytes,
    }))
  );
}

function printFrontendTable(rows) {
  console.log("\nFrontend SSR document vs CSR data fetch");
  console.table(
    rows.map((row) => ({
      route: row.route,
      path: row.path,
      ssrAvgMs: row.ssrDocument.avgMs,
      csrAvgMs: row.csrDataFetch.avgMs,
      deltaMs: row.ssrVsCsrDeltaMs,
      seoOk: row.seo.ok,
      titleLength: row.seo.titleLength,
      descriptionLength: row.seo.descriptionLength,
      h1Count: row.seo.h1Count,
    }))
  );
}

function printLighthouseTable(result) {
  if (result.skipped) {
    console.log(`\nLighthouse skipped: ${result.reason}`);
    return;
  }

  console.log("\nLighthouse");
  console.table(
    result.map((row) => ({
      route: row.route,
      performance: row.categories?.performance ?? "ERROR",
      seo: row.categories?.seo ?? "ERROR",
      accessibility: row.categories?.accessibility ?? "ERROR",
      bestPractices: row.categories?.["best-practices"] ?? "ERROR",
      fcpMs: row.metrics?.fcpMs ?? "-",
      lcpMs: row.metrics?.lcpMs ?? "-",
      tbtMs: row.metrics?.tbtMs ?? "-",
      cls: row.metrics?.cls ?? "-",
      error: row.error ? row.error.slice(0, 80) : "",
    }))
  );
}

async function main() {
  const config = parseArgs(process.argv);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const gateCookie = await resolveGateCookie(config);
  const safeConfig = {
    ...config,
    redis: config.redis ? "[configured]" : "",
    gatePassword: config.gatePassword ? "[configured]" : "",
    gateCookie: gateCookie ? "[configured]" : "",
  };

  console.log("System performance benchmark starting...");
  console.log(JSON.stringify(safeConfig, null, 2));
  console.log(
    gateCookie
      ? "Access Gate: passed, measuring SEO after gate."
      : "Access Gate: no cookie, measuring public/gated response."
  );

  const started = new Date();
  const [api, frontend, redis] = await Promise.all([
    benchmarkApis(config),
    benchmarkFrontend(config, gateCookie),
    readRedisStats(config),
  ]);

  const lighthouse = await runLighthouse(config, gateCookie);

  const report = {
    generatedAt: started.toISOString(),
    config: safeConfig,
    gate: {
      enabled: config.useGate,
      passed: Boolean(gateCookie),
      mode: gateCookie ? "after-access-gate" : "without-access-gate-cookie",
    },
    api,
    frontend,
    lighthouse,
    redis,
    thresholds: {
      apiP95GoodMs: 300,
      apiP95NeedsImprovementMs: 800,
      lighthouseSeoTarget: 90,
      fcpGoodMs: 1800,
      lcpGoodMs: 2500,
      tbtGoodMs: 200,
      redisHitRatioTargetPercent: 80,
    },
  };

  const jsonPath = path.join(REPORT_DIR, `performance-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  printApiTable("Public backend APIs", api);
  printFrontendTable(frontend);
  printLighthouseTable(lighthouse);
  console.log("\nRedis cache");
  console.table([redis]);
  console.log(`\nReport saved: ${jsonPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
