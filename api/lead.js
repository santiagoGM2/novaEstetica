// Serverless function — POST /api/lead
// Recibe los datos del Quiz y crea/actualiza el contacto en GoHighLevel
// con tags por servicio de interés, tiempo estimado y prioridad.
//
// Variables de entorno requeridas (configurar en Vercel → Settings → Environment Variables):
//   GHL_API_KEY      — Private Integration token (Bearer) generado en
//                      Settings → Private Integrations → Generate token.
//                      Scopes mínimos: contacts.write, contacts.readonly.
//   GHL_LOCATION_ID  — ID de la Location (Sub-Account) en GHL.
//                      Settings → Business Profile → Location ID.

const GHL_ENDPOINT = 'https://services.leadconnectorhq.com/contacts/'
const GHL_API_VERSION = '2021-07-28'

function normalizeTag(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizePhone(p) {
  const digits = String(p || '').replace(/[^\d+]/g, '')
  if (!digits) return ''
  if (digits.startsWith('+')) return digits
  // Si vienen 10 dígitos (formato Colombia local) anteponer +57
  if (/^\d{10}$/.test(digits)) return `+57${digits}`
  return `+${digits}`
}

function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, phone, zone, time, priority, source = 'landing-quiz' } =
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

  if (!name || !phone) {
    return res.status(400).json({ error: 'name y phone son obligatorios' })
  }

  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID

  if (!apiKey || !locationId) {
    console.error('[lead] Faltan variables de entorno GHL_API_KEY o GHL_LOCATION_ID')
    return res.status(500).json({ error: 'Servidor no configurado' })
  }

  const { firstName, lastName } = splitName(name)
  const phoneE164 = normalizePhone(phone)

  const tags = [
    zone && `interesado-${normalizeTag(zone)}`,
    time && `tiempo-${normalizeTag(time)}`,
    priority && `prioridad-${normalizeTag(priority)}`,
    `fuente-${normalizeTag(source)}`,
    'quiz-completado',
    'no-agendo', // se reemplaza con "cita-agendada" cuando dispare el workflow del calendar
  ].filter(Boolean)

  const payload = {
    firstName,
    lastName: lastName || undefined,
    phone: phoneE164,
    locationId,
    source,
    tags,
  }

  try {
    const ghlRes = await fetch(GHL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: GHL_API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await ghlRes.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!ghlRes.ok) {
      console.error('[lead] GHL respondió no-OK:', ghlRes.status, text)
      return res.status(502).json({ error: 'Upstream error', status: ghlRes.status, detail: data })
    }

    return res.status(200).json({
      ok: true,
      contactId: data.contact?.id ?? data.id ?? null,
      tags,
    })
  } catch (err) {
    console.error('[lead] Excepción al llamar a GHL:', err)
    return res.status(500).json({ error: 'Error interno', message: String(err?.message || err) })
  }
}
