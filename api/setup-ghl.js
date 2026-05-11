// Serverless function — POST /api/setup-ghl
//
// Ejecutar UNA SOLA VEZ contra el deploy de Vercel para crear en GHL:
//   - 4 custom fields (zona_interes, horas_recuperadas, prioridad, fuente)
//   - 1 pipeline "Nova - Captación Landing" con 7 etapas
//
// Tags: NO se pre-crean. GHL los crea automáticamente cuando llegan
// con el primer lead del quiz.
//
// Workflows: NO se pueden crear vía API (limitación real de GHL).
// Ver WORKFLOW_SETUP.md para configurarlos manualmente en la UI.
//
// Uso:
//   curl -X POST https://<deploy>.vercel.app/api/setup-ghl
//   o desde Postman / Thunder Client.
//
// La función es idempotente: si los recursos ya existen, los reporta
// y no falla. Cada acción se loguea en la respuesta JSON.

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'

const CUSTOM_FIELDS = [
  { name: 'Zona de interés',     fieldKey: 'contact.zona_interes',     dataType: 'TEXT' },
  { name: 'Horas recuperadas',   fieldKey: 'contact.horas_recuperadas', dataType: 'TEXT' },
  { name: 'Prioridad declarada', fieldKey: 'contact.prioridad',         dataType: 'TEXT' },
  { name: 'Fuente',              fieldKey: 'contact.fuente',            dataType: 'TEXT' },
]

const PIPELINE_NAME = 'Nova - Captación Landing'
const PIPELINE_STAGES = [
  'Lead Nuevo',
  'Diagnóstico Solicitado',
  'Cita Agendada',
  'Cita Confirmada',
  'Cita Realizada',
  'Convertido',
  'Perdido',
]

function authHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function listExistingCustomFields(apiKey, locationId) {
  const res = await fetch(`${GHL_BASE}/locations/${locationId}/customFields`, {
    method: 'GET',
    headers: authHeaders(apiKey),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`No se pudieron listar custom fields: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.customFields ?? data ?? []
}

async function createCustomField(apiKey, locationId, field) {
  const res = await fetch(`${GHL_BASE}/locations/${locationId}/customFields`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      name: field.name,
      fieldKey: field.fieldKey,
      dataType: field.dataType,
      placeholder: field.name,
      model: 'contact',
    }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) {
    return { ok: false, status: res.status, detail: data, field: field.name }
  }
  return { ok: true, id: data.customField?.id ?? data.id ?? null, field: field.name }
}

async function listExistingPipelines(apiKey, locationId) {
  const res = await fetch(`${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`, {
    method: 'GET',
    headers: authHeaders(apiKey),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`No se pudieron listar pipelines: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.pipelines ?? []
}

async function createPipeline(apiKey, locationId) {
  // Endpoint de pipelines en v2: el método sigue siendo objeto de cambios en
  // GHL; documentamos lo que está disponible públicamente. Si la API rechaza
  // el endpoint, hay que crearlo manualmente y obtener su ID desde la UI
  // (Settings → Pipelines).
  const res = await fetch(`${GHL_BASE}/opportunities/pipelines`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      name: PIPELINE_NAME,
      stages: PIPELINE_STAGES.map((name, i) => ({
        name,
        position: i,
        showInFunnel: true,
      })),
    }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) {
    return { ok: false, status: res.status, detail: data }
  }
  return { ok: true, id: data.pipeline?.id ?? data.id ?? null, stages: data.pipeline?.stages ?? data.stages ?? [] }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID
  if (!apiKey || !locationId) {
    return res.status(500).json({ error: 'Faltan GHL_API_KEY o GHL_LOCATION_ID en variables de entorno' })
  }

  const log = []
  const errors = []

  // ---------- 1. Custom fields ----------
  try {
    const existing = await listExistingCustomFields(apiKey, locationId)
    const existingKeys = new Set(existing.map((f) => f.fieldKey ?? f.name))

    for (const field of CUSTOM_FIELDS) {
      if (existingKeys.has(field.fieldKey) || existingKeys.has(field.name)) {
        log.push(`✓ Custom field "${field.name}" ya existe — skip`)
        continue
      }
      const result = await createCustomField(apiKey, locationId, field)
      if (result.ok) {
        log.push(`✓ Custom field "${field.name}" creado (id: ${result.id ?? 'sin id'})`)
      } else {
        errors.push(`✗ Error creando custom field "${field.name}" — status ${result.status}`)
        log.push(`✗ Custom field "${field.name}" falló: ${JSON.stringify(result.detail)}`)
      }
    }
  } catch (err) {
    errors.push(`✗ Excepción al gestionar custom fields: ${err.message}`)
    log.push(String(err))
  }

  // ---------- 2. Pipeline ----------
  let pipelineId = null
  try {
    const pipelines = await listExistingPipelines(apiKey, locationId)
    const found = pipelines.find((p) => p.name === PIPELINE_NAME)
    if (found) {
      pipelineId = found.id
      log.push(`✓ Pipeline "${PIPELINE_NAME}" ya existe — skip (id: ${found.id})`)
      log.push(`  Etapas detectadas: ${(found.stages ?? []).map((s) => s.name).join(' → ')}`)
    } else {
      const result = await createPipeline(apiKey, locationId)
      if (result.ok) {
        pipelineId = result.id
        log.push(`✓ Pipeline "${PIPELINE_NAME}" creado (id: ${result.id ?? 'sin id'})`)
        log.push(`  ${PIPELINE_STAGES.length} etapas: ${PIPELINE_STAGES.join(' → ')}`)
      } else {
        errors.push(`✗ Pipeline no se pudo crear via API — status ${result.status}`)
        log.push(`  Detalle: ${JSON.stringify(result.detail)}`)
        log.push(`  Acción: créalo manual en Settings → Pipelines y agrega las 7 etapas en orden`)
      }
    }
  } catch (err) {
    errors.push(`✗ Excepción al gestionar pipeline: ${err.message}`)
    log.push(String(err))
  }

  // ---------- 3. Tags ----------
  log.push('— Tags: omitidos por diseño. GHL los crea automáticamente al recibir el primer lead del quiz.')

  // ---------- 4. Workflows ----------
  log.push('— Workflows: no se pueden crear vía API. Ver WORKFLOW_SETUP.md para configurarlos manualmente.')

  return res.status(errors.length ? 207 : 200).json({
    ok: errors.length === 0,
    pipelineId,
    log,
    errors,
    nextSteps: [
      'Si pipelineId quedó null, créalo manualmente en GHL → Settings → Pipelines',
      'Configura los 5 workflows siguiendo WORKFLOW_SETUP.md',
      'Verifica que los custom fields aparezcan en GHL → Settings → Custom Fields',
    ],
  })
}
