import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const data = await page.evaluate(() => {
  const hero = document.querySelector('.hero')
  const heroContent = document.querySelector('.hero-content')
  const hero3d = document.querySelector('.hero-3d')
  const get = (el) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
      gridColumn: cs.gridColumn,
      alignItems: cs.alignItems,
      alignSelf: cs.alignSelf,
      padding: cs.padding,
      minHeight: cs.minHeight,
      width: r.width,
      height: r.height,
      x: r.x,
      y: r.y,
    }
  }
  return {
    hero: get(hero),
    heroContent: get(heroContent),
    hero3d: get(hero3d),
  }
})
console.log(JSON.stringify(data, null, 2))
await browser.close()
