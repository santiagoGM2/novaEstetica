// E2E smoke test del Quiz contra el dev server.
// Cubre:
//  - Validación: nombre vacío
//  - Validación: teléfono corto (<10 dígitos) + verificar que NO se disparó el webhook
//  - Validación: respuestas faltantes (skipped — no alcanzable via UI normal)
//  - Flujo feliz: 4 pasos completos → "Enviando..." → success → scroll a calendar
//
// Por defecto corre en modo MOCK del Quiz (.env.local con VITE_GHL_WEBHOOK_URL
// vacía haría que dispare el webhook real — para test E2E intercepta la
// network igual y NO deja salir el POST a GHL).
//
// Uso:
//   node scripts/test-quiz-flow.mjs --url=http://localhost:5174/
import { chromium } from '@playwright/test'

const URL_ARG = process.argv.find((a) => a.startsWith('--url='))
const TARGET = URL_ARG ? URL_ARG.slice(6) : 'http://localhost:5174/'

const results = []
const log = (label, status, detail = '') => {
  const sym = status === 'pass' ? '✓' : status === 'skip' ? '⊘' : '✗'
  console.log(`  ${sym} ${label}${detail ? ` — ${detail}` : ''}`)
  results.push({ label, status, detail })
}

async function setupPage(browser, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // Track all webhook POST attempts. Tests assert on this to confirm
  // the network was (or was NOT) hit at the right moment.
  page.webhookCalls = []
  page.on('request', (req) => {
    if (req.url().includes('services.leadconnectorhq.com/hooks/')) {
      page.webhookCalls.push({ url: req.url(), method: req.method(), body: req.postData() })
    }
  })

  // Intercept any outbound POST to GHL webhook for safety, return 200 OK
  // without actually hitting the real endpoint. Add a small delay so the
  // submitting state ("Enviando…") is observable in assertions.
  const stubDelay = options.stubDelay ?? 0
  await page.route('**/services.leadconnectorhq.com/hooks/**', async (route) => {
    if (stubDelay) await new Promise((r) => setTimeout(r, stubDelay))
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
  })

  page.consoleLogs = []
  page.on('console', (m) => page.consoleLogs.push({ type: m.type(), text: m.text() }))

  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(1000)
  return { ctx, page }
}

async function scrollToQuiz(page) {
  await page.evaluate(() => {
    const q = document.getElementById('quiz')
    if (q) q.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
  await page.waitForTimeout(500)
}

// Robust selector helpers. The Quiz markup is:
//   <button class="zone-btn"><span class="zone-btn-icon">A</span><span class="zone-btn-label">Axilas</span></button>
// There is NO data-* attribute, so we target by the label's exact text.
async function clickZone(page, zone) {
  await page.locator(`.zone-btn:has(.zone-btn-label:text-is("${zone}"))`).click()
}
async function clickTime(page, timeValue) {
  const labelMap = { '2-4 horas': '2 – 4 horas', '5-8 horas': '5 – 8 horas', '8+ horas': 'Más de 8 horas' }
  const label = labelMap[timeValue]
  await page.locator(`.time-btn:has(.time-btn-label:text-is("${label}"))`).click()
}
async function clickPriority(page, priority) {
  const headingMap = {
    precio: 'Una oferta barata',
    calidad: 'Una atención personalizada que respete mi piel',
  }
  await page.locator(`.priority-btn:has(.priority-btn-heading:text-is("${headingMap[priority]}"))`).click()
}

async function completeSteps1to3(page, { zone = 'Axilas', time = '5-8 horas', priority = 'calidad' } = {}) {
  await clickZone(page, zone)
  await page.waitForTimeout(500)
  await clickTime(page, time)
  await page.waitForTimeout(500)
  await clickPriority(page, priority)
  await page.waitForTimeout(500)
}

// =====================================================================
// TEST 1: validación de nombre vacío
// =====================================================================
async function testEmptyName(browser) {
  console.log('\n[TEST 1] Validación: nombre vacío')
  const { ctx, page } = await setupPage(browser)
  await scrollToQuiz(page)
  await completeSteps1to3(page)

  await page.locator('button.quiz-submit').click()
  await page.waitForTimeout(400)

  const errorText = await page.locator('.quiz-error p').textContent().catch(() => '')
  log('Error visible cuando nombre + phone vacíos',
    /Completa tu nombre/.test(errorText) ? 'pass' : 'fail',
    `texto: "${errorText}"`)
  const stillOnStep4 = await page.locator('input[name="nombre"]').isVisible()
  log('Sigue en paso 4 (no avanza a success)', stillOnStep4 ? 'pass' : 'fail')
  log('NO disparó POST al webhook', page.webhookCalls.length === 0 ? 'pass' : 'fail', `count: ${page.webhookCalls.length}`)

  await ctx.close()
}

// =====================================================================
// TEST 2: validación teléfono corto + asserción de no-fire de webhook
// =====================================================================
async function testShortPhone(browser) {
  console.log('\n[TEST 2] Validación: teléfono < 10 dígitos')
  const { ctx, page } = await setupPage(browser)
  await scrollToQuiz(page)
  await completeSteps1to3(page)

  await page.locator('input[name="nombre"]').fill('María José')
  await page.locator('input[name="whatsapp"]').fill('300 1234')  // 7 dígitos
  await page.locator('button.quiz-submit').click()
  await page.waitForTimeout(400)

  const errorText = await page.locator('.quiz-error p').textContent().catch(() => '')
  log('Error de teléfono corto visible',
    /10 d[íi]gitos.*celular/i.test(errorText) ? 'pass' : 'fail',
    `texto: "${errorText}"`)
  // Crítico: la validación debe bloquear el POST.
  log('NO disparó POST al webhook (validación bloqueó)',
    page.webhookCalls.length === 0 ? 'pass' : 'fail',
    `count: ${page.webhookCalls.length}`)

  await ctx.close()
}

// =====================================================================
// TEST 3: flujo feliz completo (sin scroll a calendar — eliminado)
// =====================================================================
async function testHappyPath(browser) {
  console.log('\n[TEST 3] Flujo feliz: 4 pasos + success')
  // Delay en el stub: el botón "Enviando…" debe ser observable por al menos
  // ~1s para evitar flakes cuando Playwright captura más lento que lo normal.
  const { ctx, page } = await setupPage(browser, { stubDelay: 1200 })

  await scrollToQuiz(page)
  await completeSteps1to3(page, { zone: 'Bikini', time: '8+ horas', priority: 'calidad' })

  await page.locator('input[name="nombre"]').fill('Valentina Test')
  await page.locator('input[name="email"]').fill('valentina@test.com')
  await page.locator('input[name="whatsapp"]').fill('3001234567')

  // Verificar que el botón cambia a "Enviando…" durante el submit
  await page.locator('button.quiz-submit').click()
  let buttonTextDuringSubmit = ''
  try {
    await page.waitForFunction(
      () => /Enviando/.test(document.querySelector('button.quiz-submit')?.textContent || ''),
      { timeout: 1500 }
    )
    buttonTextDuringSubmit = await page.locator('button.quiz-submit').textContent()
  } catch {
    buttonTextDuringSubmit = await page.locator('button.quiz-submit').textContent().catch(() => '')
  }
  log('Botón muestra "Enviando…" durante submit',
    /Enviando/.test(buttonTextDuringSubmit) ? 'pass' : 'fail',
    `texto: "${buttonTextDuringSubmit.trim()}"`)

  await page.waitForSelector('.quiz-success', { state: 'visible', timeout: 10_000 })
  log('Pantalla de éxito visible', 'pass')

  log('Webhook (interceptado) recibió 1 POST',
    page.webhookCalls.length === 1 ? 'pass' : 'fail',
    `count: ${page.webhookCalls.length}`)
  if (page.webhookCalls[0]) {
    let payload = null
    try { payload = JSON.parse(page.webhookCalls[0].body || '{}') } catch {}
    const payloadOk = payload && payload.firstName === 'Valentina Test'
      && payload.email === 'valentina@test.com'
      && payload.phone === '+573001234567'
      && payload.zone === 'Bikini'
      && payload.time === '8+ horas'
      && payload.priority === 'calidad'
      && payload.source === 'landing-quiz'
    log('Payload del webhook correcto', payloadOk ? 'pass' : 'fail', JSON.stringify(payload))
  }

  // Verificar que el success state muestra el CTA de WhatsApp
  // (reemplaza al antiguo CTA hacia el calendar, ya eliminado).
  const waCtaVisible = await page.locator('.quiz-success a[href*="wa.me"], .quiz-success a[href*="whatsapp.com"]').isVisible().catch(() => false)
  log('Success state muestra CTA hacia WhatsApp', waCtaVisible ? 'pass' : 'fail')

  await ctx.close()
}

// =====================================================================
// TEST 4: respuestas del quiz faltantes (SKIPPED)
// =====================================================================
// La validación interna del componente es:
//   if (!answers.zone || !answers.time || !answers.priority)
//     setError('Algunas respuestas del diagnóstico están vacías...')
//
// Pero esta rama NO es alcanzable vía UI normal: la función advance()
// del Quiz setea cada answer ANTES de cambiar de step, por lo que llegar
// al paso 4 implica que zone/time/priority ya tienen valor. Para forzar
// el estado answers.zone=null en paso 4 habría que manipular el estado
// interno de React desde Playwright (page.evaluate + reach into React
// internals), lo cual es frágil y dependiente de la versión de React.
//
// La lógica de la validación queda cubierta a nivel de código por
// inspección manual y por TypeScript-style type narrowing. Si en el
// futuro se agrega un paso "Volver" que permita modificar zone después
// de avanzar, este test se vuelve alcanzable y se debe implementar.
async function testMissingAnswersSkipped() {
  console.log('\n[TEST 4] Validación: respuestas faltantes')
  log('Test skipped — estado answers.zone=null no alcanzable via UI normal',
    'skip', 'ver comentario en el código')
}

// =====================================================================
// TEST 5: email con formato inválido bloquea el submit
// =====================================================================
async function testInvalidEmail(browser) {
  console.log('\n[TEST 5] Validación: email con formato inválido')
  const { ctx, page } = await setupPage(browser)
  await scrollToQuiz(page)
  await completeSteps1to3(page)

  await page.locator('input[name="nombre"]').fill('Test Email')
  await page.locator('input[name="email"]').fill('no-es-un-email')  // sin @ ni .
  await page.locator('input[name="whatsapp"]').fill('3001234567')
  await page.locator('button.quiz-submit').click()
  await page.waitForTimeout(400)

  const errorText = await page.locator('.quiz-error p').textContent().catch(() => '')
  log('Error de email inválido visible',
    /email est[ée] bien escrito/i.test(errorText) ? 'pass' : 'fail',
    `texto: "${errorText}"`)
  log('NO disparó POST al webhook (validación bloqueó)',
    page.webhookCalls.length === 0 ? 'pass' : 'fail',
    `count: ${page.webhookCalls.length}`)

  await ctx.close()
}

// =====================================================================
// TEST 6: email vacío es válido (campo opcional) + payload sin email
// =====================================================================
async function testEmptyEmailIsValid(browser) {
  console.log('\n[TEST 6] Validación: email vacío es válido (campo opcional)')
  const { ctx, page } = await setupPage(browser)
  await scrollToQuiz(page)
  await completeSteps1to3(page, { zone: 'Rostro', time: '2-4 horas', priority: 'precio' })

  await page.locator('input[name="nombre"]').fill('Sin Email')
  // email queda vacío deliberadamente
  await page.locator('input[name="whatsapp"]').fill('3009876543')
  await page.locator('button.quiz-submit').click()

  await page.waitForSelector('.quiz-success', { state: 'visible', timeout: 10_000 })
  log('Submit exitoso sin email', 'pass')
  log('Webhook recibió 1 POST',
    page.webhookCalls.length === 1 ? 'pass' : 'fail',
    `count: ${page.webhookCalls.length}`)
  if (page.webhookCalls[0]) {
    let payload = null
    try { payload = JSON.parse(page.webhookCalls[0].body || '{}') } catch {}
    // Crítico: cuando no se llena email, NO debe estar en el payload.
    log('Payload NO incluye campo email',
      payload && !('email' in payload) ? 'pass' : 'fail',
      JSON.stringify(payload))
  }

  await ctx.close()
}

// =====================================================================
// TEST 7: tarjetas de servicios abren WhatsApp con mensaje personalizado
// =====================================================================
// Cada card (Faciales · Cejas & Pestañas · Corporales) tiene una CTA que
// es un <a href="https://api.whatsapp.com/send?phone=573105725730&text=...">.
// Verificamos los hrefs sin disparar la navegación.
async function testServiceCardsWhatsAppLinks(browser) {
  console.log('\n[TEST 7] Tarjetas de servicios → WhatsApp links')
  const { ctx, page } = await setupPage(browser)

  const expected = [
    { match: 'Faciales',          keyword: 'Faciales%20Premium' },
    { match: 'Cejas',             keyword: 'Dise%C3%B1o%20de%20Mirada%20Ejecutiva' },
    { match: 'Corporales',        keyword: 'Escultura%20Corporal%20High-End' },
  ]

  for (const { match, keyword } of expected) {
    const cta = page.locator(`.service-card:has-text("${match}") .service-card-cta`).first()
    await cta.scrollIntoViewIfNeeded().catch(() => {})
    const href = await cta.getAttribute('href').catch(() => null)
    const ok = href && href.startsWith('https://api.whatsapp.com/send?phone=573105725730') && href.includes(keyword)
    log(`Card "${match}" abre WhatsApp con mensaje correcto`,
      ok ? 'pass' : 'fail',
      `href: ${href}`)
  }

  // CTA general "Quiero ver todos los servicios"
  const generalCta = page.locator('.services-all-cta').first()
  await generalCta.scrollIntoViewIfNeeded().catch(() => {})
  const generalHref = await generalCta.getAttribute('href').catch(() => null)
  const generalOk =
    generalHref &&
    generalHref.startsWith('https://api.whatsapp.com/send?phone=573105725730') &&
    generalHref.includes('otros%20servicios')
  log('CTA general abre WhatsApp con mensaje "otros servicios"',
    generalOk ? 'pass' : 'fail',
    `href: ${generalHref}`)

  await ctx.close()
}

// =====================================================================
// Main
// =====================================================================
async function main() {
  console.log(`\n[quiz-flow] target: ${TARGET}`)
  const browser = await chromium.launch({ headless: true })

  try {
    await testEmptyName(browser)
    await testShortPhone(browser)
    await testHappyPath(browser)
    await testMissingAnswersSkipped()
    await testInvalidEmail(browser)
    await testEmptyEmailIsValid(browser)
    await testServiceCardsWhatsAppLinks(browser)
  } finally {
    await browser.close()
  }

  const passed = results.filter((r) => r.status === 'pass').length
  const skipped = results.filter((r) => r.status === 'skip').length
  const failed = results.filter((r) => r.status === 'fail').length
  console.log(`\n━━━ SUMMARY ━━━`)
  console.log(`  passed:  ${passed}`)
  console.log(`  skipped: ${skipped}`)
  console.log(`  failed:  ${failed}`)
  if (failed) {
    console.log(`  failures:`)
    results.filter((r) => r.status === 'fail').forEach((r) => console.log(`    ✗ ${r.label} — ${r.detail}`))
  }
  process.exit(failed ? 1 : 0)
}

main().catch((err) => {
  console.error('[quiz-flow] runtime error:', err)
  process.exit(1)
})
