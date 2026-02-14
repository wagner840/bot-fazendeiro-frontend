import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.UIUX_BASE_URL || "http://localhost:5173";
const STORAGE_STATE_PATH = process.env.UIUX_STORAGE_STATE
  ? path.resolve(process.cwd(), "..", process.env.UIUX_STORAGE_STATE)
  : path.resolve(process.cwd(), "..", "auth-state.json");
const ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  "..",
  "docs",
  "plans",
  "artifacts",
  "ui-ux-audit-2026-02-14"
);

const ROUTES = [
  "/dashboard",
  "/dashboard/funcionarios",
  "/dashboard/produtos",
  "/dashboard/estoque",
  "/dashboard/encomendas",
  "/dashboard/financeiro",
  "/dashboard/auditoria",
  "/dashboard/empresas",
  "/dashboard/usuarios",
  "/dashboard/configuracoes",
  "/dashboard/superadmin",
  "/dashboard/superadmin/testers",
  "/checkout",
  "/assinatura-expirada",
];

const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

async function ensureDirs() {
  await fs.mkdir(path.join(ARTIFACT_ROOT, "screenshots", "desktop"), { recursive: true });
  await fs.mkdir(path.join(ARTIFACT_ROOT, "screenshots", "mobile"), { recursive: true });
}

function toSafeName(route) {
  if (route === "/") return "root";
  return route.replace(/^\//, "").replace(/\//g, "__");
}

async function run() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const targetUrl = `${BASE_URL}${route}`;
      const routeKey = toSafeName(route);
      const screenshotPath = path.join(
        ARTIFACT_ROOT,
        "screenshots",
        viewport.id,
        `${routeKey}.png`
      );

      const item = {
        viewport: viewport.id,
        route,
        targetUrl,
        finalUrl: null,
        title: null,
        requiresAuth: false,
        unauthorized: false,
        screenshotPath: path.relative(path.resolve(process.cwd(), ".."), screenshotPath),
        error: null,
      };

      try {
        await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
        item.finalUrl = page.url();
        item.title = await page.title();
        item.requiresAuth = item.finalUrl.includes("/login");
        item.unauthorized = item.finalUrl.includes("/unauthorized");
        await page.screenshot({ path: screenshotPath, fullPage: true });
      } catch (error) {
        item.error = error instanceof Error ? error.message : String(error);
      }

      results.push(item);
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    storageStatePath: path.relative(path.resolve(process.cwd(), ".."), STORAGE_STATE_PATH),
    routes: ROUTES,
    viewports: VIEWPORTS,
    results,
  };

  const outputPath = path.join(ARTIFACT_ROOT, "route_capture_results.json");
  await fs.writeFile(outputPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`Saved ${outputPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
