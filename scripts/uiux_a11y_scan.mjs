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
  "/checkout",
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: STORAGE_STATE_PATH,
  });
  const page = await context.newPage();
  const results = [];

  for (const route of ROUTES) {
    const targetUrl = `${BASE_URL}${route}`;
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });

    const data = await page.evaluate(() => {
      const focusable = Array.from(
        document.querySelectorAll("a, button, input, select, textarea, [tabindex]")
      );
      const imgAll = document.querySelectorAll("img");
      const imgWithoutAlt = document.querySelectorAll("img:not([alt])");
      const iconButtons = Array.from(document.querySelectorAll("button")).filter((btn) => {
        const text = btn.textContent?.trim() || "";
        const hasAria = btn.hasAttribute("aria-label");
        return text.length === 0 && !hasAria;
      });

      return {
        title: document.title,
        url: window.location.href,
        headings: {
          h1: document.querySelectorAll("h1").length,
          h2: document.querySelectorAll("h2").length,
          h3: document.querySelectorAll("h3").length,
        },
        counts: {
          links: document.querySelectorAll("a").length,
          buttons: document.querySelectorAll("button").length,
          inputs: document.querySelectorAll("input, select, textarea").length,
          focusables: focusable.length,
          forms: document.querySelectorAll("form").length,
        },
        media: {
          images: imgAll.length,
          imagesWithoutAlt: imgWithoutAlt.length,
        },
        potentialIssues: {
          iconButtonsWithoutLabel: iconButtons.length,
        },
      };
    });

    results.push({ route, targetUrl, ...data });
  }

  await context.close();
  await browser.close();

  const outputPath = path.join(ARTIFACT_ROOT, "a11y_scan_results.json");
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        storageStatePath: path.relative(path.resolve(process.cwd(), ".."), STORAGE_STATE_PATH),
        results,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Saved ${outputPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
