import { chromium } from '@playwright/test'

const TARGET = 'http://localhost:5173/'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const failures = []
page.on('requestfailed', (req) => {
  failures.push({ url: req.url(), failure: req.failure()?.errorText })
})
page.on('response', (res) => {
  const url = res.url()
  const status = res.status()
  if (url.includes('/assets/') || url.includes('leadconnectorhq')) {
    console.log(`  ${status}  ${url}`)
  }
  if (status >= 400 && !url.includes('favicon')) {
    failures.push({ url, status })
  }
})

console.log(`\n[verify] navigating to ${TARGET}`)
await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30_000 })
await page.waitForTimeout(2000)

// Scroll to calendar to trigger iframe load
await page.evaluate(() => {
  const cal = document.getElementById('calendar')
  if (cal) cal.scrollIntoView({ behavior: 'instant', block: 'start' })
})
await page.waitForTimeout(3000)

// Check elements visibility
const probe = await page.evaluate(() => {
  const r = {}
  const logo = document.querySelector('.logo-img')
  if (logo) {
    const cs = getComputedStyle(logo)
    r.logo = { src: logo.currentSrc, complete: logo.complete, naturalW: logo.naturalWidth, naturalH: logo.naturalHeight, display: cs.display }
  }
  const espVid = document.querySelector('.espacio-video')
  if (espVid) {
    r.espacioVideo = { src: espVid.currentSrc, readyState: espVid.readyState, paused: espVid.paused, w: espVid.videoWidth, h: espVid.videoHeight }
  }
  const proofVid = document.querySelector('.proof-media-video')
  if (proofVid) {
    r.proofVideo = { src: proofVid.currentSrc, readyState: proofVid.readyState, w: proofVid.videoWidth, h: proofVid.videoHeight }
  }
  const iframe = document.querySelector('.calendar-wrap iframe')
  if (iframe) {
    const rect = iframe.getBoundingClientRect()
    r.iframe = { src: iframe.src, w: rect.width, h: rect.height, x: rect.x, y: rect.y }
  }
  return r
})

console.log('\n[verify] element probe:')
console.log(JSON.stringify(probe, null, 2))

if (failures.length) {
  console.log('\n[verify] FAILURES:')
  failures.forEach((f) => console.log(' ', JSON.stringify(f)))
} else {
  console.log('\n[verify] no network failures.')
}

await browser.close()
