# WORKFLOW_SETUP.md — Configuración de GoHighLevel para Nova

Arquitectura **100% en GHL UI**. El frontend solo envía un POST al Inbound
Webhook del workflow maestro; toda la lógica de tags, custom fields,
pipeline y secuencias de WhatsApp vive en GHL.

> **Cambio respecto a versiones anteriores:** antes había serverless
> functions (`/api/lead`, `/api/setup-ghl`). Se eliminaron. El quiz manda
> los datos directo al webhook de GHL — un solo punto de entrada, sin
> código backend que mantener.

---

## Tabla de contenidos

- [0. Resumen](#0-resumen)
- [1. Variable de entorno (Vercel)](#1-variable-de-entorno-vercel)
- [2. Setup manual one-time en GHL](#2-setup-manual-one-time-en-ghl)
  - [2.1 Custom Fields](#21-custom-fields)
  - [2.2 Pipeline](#22-pipeline)
- [3. Workflow 0 — "Captación Quiz Landing"](#3-workflow-0--captación-quiz-landing-el-master)
- [4. Workflows downstream (5)](#4-workflows-downstream-5)
  - [Workflow 1: Bienvenida Lead Landing](#workflow-1-bienvenida-lead-landing)
  - [Workflow 2: Cita Agendada Confirmación](#workflow-2-cita-agendada-confirmación)
  - [Workflow 3: Recordatorio 24h antes](#workflow-3-recordatorio-24h-antes)
  - [Workflow 4: Recordatorio 3h antes](#workflow-4-recordatorio-3h-antes)
  - [Workflow 5: Seguimiento No Agendó](#workflow-5-seguimiento-no-agendó)
- [5. Checklist E2E](#5-checklist-e2e)
- [6. Troubleshooting](#6-troubleshooting)

---

## 0. Resumen

| Lo que hace el frontend | Lo que hace GHL |
| --- | --- |
| `POST` a `VITE_GHL_WEBHOOK_URL` con payload del quiz | Workflow 0 lo recibe y crea/actualiza contacto |
| Reintenta 3 veces con backoff 1s/2s/4s | Aplica custom fields + tags + mueve a pipeline |
| Si todo falla, ofrece WhatsApp como fallback | Disparan workflows downstream (bienvenida, recordatorios) |

**Payload exacto que envía el quiz:**

```json
{
  "firstName": "María José Pérez",
  "phone": "+573001234567",
  "zone": "Axilas",
  "time": "5-8 horas",
  "priority": "calidad",
  "source": "landing-quiz"
}
```

---

## 1. Variable de entorno (Vercel)

En Vercel → tu proyecto → **Settings → Environment Variables**:

| Variable | Valor | Dónde obtenerla |
| --- | --- | --- |
| `VITE_GHL_WEBHOOK_URL` | URL del Inbound Webhook | GHL → Automation → Workflows → "0 - Captación Quiz Landing" → trigger Inbound Webhook → **Copy URL** (se obtiene tras crear el workflow del paso 3) |
| `VITE_WHATSAPP_LINK` | URL oficial WhatsApp | `https://api.whatsapp.com/send/?phone=573105725730&text&type=phone_number&app_absent=0` |

Aplicar a **Production** y **Preview**. Después de cambiar, hacer
**redeploy** (Vercel no las recoge en caliente).

---

## 2. Setup manual one-time en GHL

Estas dos cosas (custom fields y pipeline) se arman **una sola vez** en
la UI de GHL antes de crear el Workflow 0. El workflow las usa para
rellenar la información que llega del quiz.

### 2.1 Custom Fields

En **Settings → Custom Fields → Contact → "+ Add Field"**, crear los
siguientes:

| Field name | Field type | Key auto-generado |
| --- | --- | --- |
| Zona de interés | Single Line | `contact.zona_interes` |
| Horas recuperadas | Single Line | `contact.horas_recuperadas` |
| Prioridad declarada | Single Line | `contact.prioridad` |
| Fuente | Single Line | `contact.fuente` |

Después de crearlos, anotá sus IDs (botón `…` → Copy ID). Los necesitás
en el Workflow 0.

### 2.2 Pipeline

En **Opportunities → Pipelines → "+ New Pipeline"**:

**Nombre exacto:** `Nova - Captación Landing`

**Etapas (en este orden):**

1. Lead Nuevo
2. Diagnóstico Solicitado
3. Cita Agendada
4. Cita Confirmada
5. Cita Realizada
6. Convertido
7. Perdido

Save. Anotá el ID del pipeline (lo necesitás en el Workflow 0 también).

---

## 3. Workflow 0 — "Captación Quiz Landing" (el master)

Este es el único workflow disparado por el frontend. Recibe el payload,
crea el contacto, aplica tags, rellena custom fields, crea opportunity.

### Crearlo

**Automation → Workflows → + New Workflow → Start from Scratch**.

Nombre exacto: `0 - Captación Quiz Landing`

### Trigger

1. Click `+ Add New Trigger`
2. Tipo: **Inbound Webhook**
3. **Copiar la URL del webhook** que GHL genera y pegarla en Vercel como
   `VITE_GHL_WEBHOOK_URL` (Settings → Environment Variables). Redeploy.
4. **Test del webhook**: enviá un payload de prueba para que GHL "aprenda"
   el shape. Desde Postman / curl:

```bash
curl -X POST '<URL_DEL_WEBHOOK>' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Test Quiz",
    "phone": "+573001234567",
    "zone": "Axilas",
    "time": "5-8 horas",
    "priority": "calidad",
    "source": "landing-quiz"
  }'
```

GHL detecta los campos `firstName`, `phone`, `zone`, `time`, `priority`,
`source` y los hace disponibles como variables `{{inboundWebhookRequest.firstName}}` etc.

5. Save trigger.

### Acción 1 — Find / Create Contact

`+ Add Action → Find Contact` (preferido si ya existe el contacto por
phone) o **Create / Update Contact**:

- **First Name:** `{{inboundWebhookRequest.firstName}}`
- **Phone:** `{{inboundWebhookRequest.phone}}` (en formato E.164 — el quiz lo envía ya normalizado)
- **Source:** `{{inboundWebhookRequest.source}}` → `landing-quiz`
- **Custom Fields:**
  - Zona de interés ← `{{inboundWebhookRequest.zone}}`
  - Horas recuperadas ← `{{inboundWebhookRequest.time}}`
  - Prioridad declarada ← `{{inboundWebhookRequest.priority}}`
  - Fuente ← `{{inboundWebhookRequest.source}}`

### Acción 2 — Add Tags

`+ Add Action → Add Tag`. Agregá estos tags todos en la misma acción
(podés concatenarlos con coma en GHL):

- `lead-landing-nova`
- `quiz-completado`
- `fuente-landing-quiz`
- `no-agendo` *(estado inicial — se quita al agendar, ver Workflow 2)*

### Acción 3 — Conditional tags por respuesta

Acá podés ir con If/Else por cada respuesta, o usar la opción más limpia:
**Custom Action → Add Tag** con valor dinámico construido desde la variable.

Ejemplo para zona:

```
Add Tag: interesado-{{trigger.zone | lowercase}}
```

(Si GHL no soporta filtros tipo Liquid, usá un If/Else por cada valor
posible: 4 ramas para `zone`, 3 para `time`, 2 para `priority`.)

Tags finales que deberían quedar en el contacto:

- `interesado-axilas` / `-bikini` / `-piernas` / `-rostro`
- `tiempo-2-4-horas` / `-5-8-horas` / `-8-horas`
- `prioridad-precio` / `prioridad-calidad`

### Acción 4 — Add to Pipeline

`+ Add Action → Add to Pipeline`:
- Pipeline: **Nova - Captación Landing**
- Stage: **Diagnóstico Solicitado**

### Publish ✅

Toggle Publish (esquina superior derecha). Probá con el `curl` anterior
y verificá en **Contacts** que aparezca el contacto con todos los tags
+ custom fields + opportunity en el stage correcto.

---

## 4. Workflows downstream (5)

Estos disparan **a partir** de los tags / eventos del calendario.
No se conectan al webhook directamente.

### Workflow 1: Bienvenida Lead Landing

**Trigger:** Contact Tag → tag added `lead-landing-nova`

**Acción 1:** Wait `30 seconds` (race con webhook del calendar)

**Acción 2:** Send WhatsApp / SMS

```
Hola {{contact.first_name}}, soy Nova Aesthetic Professionals ✨

Recibimos tu diagnóstico de piel premium. En menos de 24h te contactamos personalmente para tu invitación VIP.

¿Querés agendar tu valoración ya?
👉 https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC

Cualquier duda, respondé este chat.
```

**Acción 3:** Wait `24 hours`

**Acción 4:** If/Else → tag `cita-agendada`
- Sí → End Workflow
- No → Send WhatsApp segundo recordatorio + Add Tag `re-engage-1`

### Workflow 2: Cita Agendada Confirmación

**Trigger:** Appointment → Appointment Booked, calendar `xVUu1c8gHzw3AooU5lDC`

**Acciones:**
1. Add Tag `cita-agendada`
2. Remove Tag `no-agendo`
3. Move Pipeline Stage → `Cita Agendada`
4. Send WhatsApp de confirmación con fecha/hora
5. Send Internal Notification al equipo

### Workflow 3: Recordatorio 24h antes

**Trigger:** Appointment Status Update → Confirmed, Send `24 hours before` appointment start.
Send WhatsApp con recordatorio.

### Workflow 4: Recordatorio 3h antes

**Trigger:** Appointment Status Update → Confirmed, Send `3 hours before` appointment start.
Send WhatsApp con recordatorio + link Google Maps.

### Workflow 5: Seguimiento No Agendó

**Trigger:** Contact Tag → tag added `lead-landing-nova`

**Acción 1:** Wait `3 days`

**Acción 2:** If/Else → tag `cita-agendada`
- Sí → End
- No → Send WhatsApp de re-engagement + Add Tag `seguimiento-72h`

---

## 5. Checklist E2E

Antes de pasar a producción:

- [ ] Custom Fields creados en GHL → Settings → Custom Fields (4 fields)
- [ ] Pipeline `Nova - Captación Landing` creado con 7 etapas
- [ ] Workflow 0 publicado, webhook URL copiada
- [ ] `VITE_GHL_WEBHOOK_URL` configurada en Vercel (Production + Preview)
- [ ] `VITE_WHATSAPP_LINK` configurada en Vercel
- [ ] Redeploy hecho en Vercel
- [ ] Workflows 1-5 publicados
- [ ] Calendar `xVUu1c8gHzw3AooU5lDC` activo en GHL → Calendars

**Test de E2E con un teléfono real:**

1. Completar el quiz en la landing (`/?dev=` para activar logs).
2. Confirmar en consola del navegador: cero errores, fetch a webhook resuelve 200.
3. Verificar en GHL → Contacts: contacto creado con todos los tags + custom fields.
4. **30 segundos después** debería llegar WhatsApp del Workflow 1.
5. Agendar cita en el calendar embebido.
6. Verificar: tag `cita-agendada`, movimiento a stage `Cita Agendada`, WhatsApp confirmación.
7. **72h sin agendar** (test alternativo con otro teléfono que no agende):
   debería disparar Workflow 5.

---

## 6. Troubleshooting

### "El webhook responde 404 / 405"
- Verificá que la URL en `VITE_GHL_WEBHOOK_URL` está completa y no
  trunca query strings.
- Que el Workflow 0 esté **Published** (toggle verde).

### "El contacto se crea pero los tags por respuesta no se aplican"
- Si tu GHL no acepta tags dinámicos con `{{inboundWebhookRequest.zone}}`,
  reemplazá la Acción 3 por 4 ramas If/Else (una por valor de `zone`),
  cada una con su `Add Tag` fijo. Mismo para `time` (3 ramas) y `priority` (2).

### "Los custom fields no se rellenan"
- Confirmá que mapeaste los IDs correctos en la Acción 1 del Workflow 0.
- En GHL → Settings → Custom Fields → "..." → Copy ID.

### "El frontend muestra 'Hubo un problema al enviar tus datos'"
- Abrí DevTools → Console del browser. Buscá `[Quiz]`:
  - `Webhook URL no está configurada` → falta la variable en Vercel.
  - `Webhook falló tras 3 intentos` → el endpoint no responde 2xx.
    Revisá el log del workflow en GHL → Automation → tu workflow → "Logs" tab.

### "En desarrollo veo `[MOCK] Webhook payload:` en consola"
- Es normal cuando `VITE_GHL_WEBHOOK_URL` no está en `.env.local`.
- El quiz no envía nada al webhook real, pero igual te muestra el
  success screen y scrollea al calendar — sirve para probar la UI sin
  consumir intentos en GHL.

### "Quiero forzar el quiz a usar el webhook real en desarrollo"
- Poné la URL real en tu `.env.local`. Reiniciá `npm run dev`.

### "Vercel build falla porque no existe carpeta `api/`"
- Cero acción. Vercel detecta serverless functions automáticamente.
  Si no hay `api/`, simplemente no genera funciones. El build de Vite
  sigue normal.
