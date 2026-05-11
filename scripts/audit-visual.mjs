// Visual audit script — runs Playwright headless against the local dev server
// and produces a folder of screenshots + a console log JSON for inspection.
//
// Usage:
//   node scripts/audit-visual.mjs [--url=http://localhost:5173]
//
// Output: ./audit/{desktop,mobile,mobile-small}-* .png + console.json
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(__dirname)
const OUT = join(ROOT, 'audit')

const URL_ARG = process.argv.find((a) => a.startsWith('--url='))
const TARGET = URL_ARG ? URL_ARG.slice(6) : 'http://localhost:5173/'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, devicePixelRatio: 1 },
  { name: 'mobile', width: 414, height: 896, devicePixelRatio: 2 },
  { name: 'mobile-small', width: 360, height: 780, devicePixelRatio: 2 },
]

async function ensureDir(p) {
  await mkdir(p, { recursive: true })
}

async function captureForViewport(browser, viewport) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.devicePixelRatio,
    ignoreHTTPSErrors: true,
  })
  const page = await ctx.newPage()

  const consoleEntries = []
  const pageErrors = []

  page.on('console', (msg) => {
    consoleEntries.push({ type: msg.type(), text: msg.text() })
  })
  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message, stack: err.stack })
  })

  console.log(`\n[audit] ${viewport.name} (${viewport.width}x${viewport.height}) → ${TARGET}`)
  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30_000 })
  // Give Lenis + GSAP + R3F a beat to settle
  await page.waitForTimeout(2000)

  // 1. Hero viewport (no scroll)
  await page.screenshot({
    path: join(OUT, `${viewport.name}-hero.png`),
    fullPage: false,
  })

  // 2. Full page
  await page.screenshot({
    path: join(OUT, `${viewport.name}-full.png`),
    fullPage: true,
  })

  // 3. Incremental scroll captures every 800px
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = 800
  let scrollIdx = 0
  for (let y = step; y < totalHeight; y += step) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(800) // let scroll-driven animations settle
    await page.screenshot({
      path: join(OUT, `${viewport.name}-scroll-${String(++scrollIdx).padStart(2, '0')}.png`),
      fullPage: false,
    })
  }

  // 4. Reset to top, scroll to calendar, take a calendar-specific shot
  await page.evaluate(() => {
    const cal = document.getElementById('calendar')
    if (cal) cal.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
  await page.waitForTimeout(3000) // let GHL iframe load
  await page.screenshot({
    path: join(OUT, `${viewport.name}-calendar.png`),
    fullPage: false,
  })

  // 5. Calendar full (entire calendar section)
  await page.evaluate(() => {
    const cal = document.getElementById('calendar')
    if (cal) cal.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
  await page.waitForTimeout(2000)
  // Try to capture a longer calendar view by scrolling slightly down to expose form
  await page.evaluate(() => window.scrollBy(0, 200))
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: join(OUT, `${viewport.name}-calendar-deep.png`),
    fullPage: false,
  })

  await ctx.close()
  return { consoleEntries, pageErrors, totalHeight }
}

async function main() {
  await ensureDir(OUT)
  console.log(`[audit] output dir: ${OUT}`)
  const browser = await chromium.launch({ headless: true })

  const summary = {}
  for (const vp of VIEWPORTS) {
    summary[vp.name] = await captureForViewport(browser, vp)
  }

  await browser.close()

  await writeFile(join(OUT, 'console.json'), JSON.stringify(summary, null, 2), 'utf8')
  console.log(`\n[audit] done. screenshots + console.json in ${OUT}`)

  // Print quick summary
  for (const [name, data] of Object.entries(summary)) {
    const errors = data.pageErrors.length
    const warns = data.consoleEntries.filter((e) => e.type === 'error' || e.type === 'warning').length
    const hero3D = data.consoleEntries.filter((e) => e.text.includes('[Hero3D]'))
    console.log(`[${name}] errors=${errors} warns=${warns} hero3D-logs=${hero3D.length} pageHeight=${data.totalHeight}`)
    if (hero3D.length) hero3D.forEach((e) => console.log(`  ${e.text}`))
  }
}

main().catch((err) => {
  console.error('[audit] FAILED:', err)
  process.exit(1)
})
