# WORKFLOW_SETUP.md — Configuración de GoHighLevel para Nova

Guía paso a paso para que cualquier persona del equipo, **sin conocimientos técnicos**,
deje GHL funcionando con la landing en menos de 30 minutos.

---

## Tabla de contenidos

- [0. Resumen ejecutivo](#0-resumen-ejecutivo)
- [1. Variables de entorno (Vercel)](#1-variables-de-entorno-vercel)
- [2. Ejecutar el setup automático](#2-ejecutar-el-setup-automático)
- [3. Tags (etiquetas)](#3-tags-etiquetas)
- [4. Custom Fields](#4-custom-fields)
- [5. Pipeline / Embudo](#5-pipeline--embudo)
- [6. Calendario](#6-calendario)
- [7. Workflows manuales (5 flujos)](#7-workflows-manuales-5-flujos)
  - [Workflow 1: Bienvenida Lead Landing](#workflow-1-bienvenida-lead-landing)
  - [Workflow 2: Cita Agendada Confirmación](#workflow-2-cita-agendada-confirmación)
  - [Workflow 3: Recordatorio 24h antes](#workflow-3-recordatorio-24h-antes)
  - [Workflow 4: Recordatorio 3h antes](#workflow-4-recordatorio-3h-antes)
  - [Workflow 5: Seguimiento No Agendó](#workflow-5-seguimiento-no-agendó)
- [8. Checklist de verificación end-to-end](#8-checklist-de-verificación-end-to-end)
- [9. Troubleshooting](#9-troubleshooting)

---

## 0. Resumen ejecutivo

| Lo que se crea automático | Lo que se crea manual |
| --- | --- |
| 4 custom fields | 5 workflows de automatización |
| Pipeline "Nova - Captación Landing" con 7 etapas | (Tags se crean solos al primer lead) |
| Contactos + Opportunities con cada lead del quiz | |

**Workflows = solo en la UI.** El API de GHL v2 NO permite crear workflows nuevos
programáticamente — solo listarlos, ejecutarlos y manejar versiones. Esta es una
limitación real de GHL, no del proyecto.

---

## 1. Variables de entorno (Vercel)

En Vercel → tu proyecto → **Settings → Environment Variables**, agregar:

| Variable | Valor | Dónde encontrarla |
| --- | --- | --- |
| `GHL_API_KEY` | Bearer token | GHL → Settings → **Private Integrations** → "Generate token". Scopes mínimos: `contacts.write`, `contacts.readonly`, `locations/customFields.write`, `opportunities.write`, `opportunities.readonly` |
| `GHL_LOCATION_ID` | ID de la sub-cuenta | GHL → Settings → **Business Profile** → "Location ID" |
| `VITE_WHATSAPP_LINK` | URL oficial de WhatsApp | `https://api.whatsapp.com/send/?phone=573105725730&text&type=phone_number&app_absent=0` |

Aplicar las tres a **Production** y **Preview**. Después de cambiar, hacer **redeploy**
(Vercel no las recoge en caliente).

---

## 2. Ejecutar el setup automático

Una vez configuradas las variables y desplegado el sitio:

```bash
curl -X POST https://<tu-deploy>.vercel.app/api/setup-ghl
```

(o desde Postman / Thunder Client / Bruno con un POST a esa URL).

**Respuesta esperada (200):**

```json
{
  "ok": true,
  "pipelineId": "abc123...",
  "log": [
    "✓ Custom field \"Zona de interés\" creado (id: ...)",
    "✓ Custom field \"Horas recuperadas\" creado (id: ...)",
    "✓ Custom field \"Prioridad declarada\" creado (id: ...)",
    "✓ Custom field \"Fuente\" creado (id: ...)",
    "✓ Pipeline \"Nova - Captación Landing\" creado (id: ...)",
    "  7 etapas: Lead Nuevo → Diagnóstico Solicitado → ..."
  ],
  "errors": []
}
```

**Si hay errores parciales** (status 207), revisar el campo `errors`. Lo más común
es que el endpoint `POST /opportunities/pipelines` haya cambiado y haya que crear
el pipeline a mano (instrucciones en sección 5).

La función es **idempotente**: podés correrla múltiples veces sin riesgo. Si algo
ya existe, lo reporta como `skip` y no falla.

---

## 3. Tags (etiquetas)

**No se pre-crean.** GHL los crea solos al recibir el primer lead. Estos son los
tags que aplicará automáticamente la serverless function `api/lead.js` cuando
alguien complete el quiz:

| Tag | Cuándo se aplica |
| --- | --- |
| `lead-landing-nova` | Siempre (todos los leads del quiz) |
| `quiz-completado` | Siempre |
| `interesado-axilas` / `-bikini` / `-piernas` / `-rostro` | Según paso 1 del quiz |
| `tiempo-2-4-horas` / `-5-8-horas` / `-8-horas` | Según paso 2 |
| `prioridad-precio` / `prioridad-calidad` | Según paso 3 |
| `fuente-landing-quiz` | Atribución |
| `no-agendo` | Estado inicial — se reemplaza por `cita-agendada` cuando agendan |
| `cita-agendada` | Lo agrega Workflow #2 al disparar el calendar |

> Después del primer lead real, anda a **Settings → Tags** y dales colores y
> orden para que el equipo comercial los vea limpios.

---

## 4. Custom Fields

Los crea automáticamente `POST /api/setup-ghl`. Si ya existen los detecta y
no los duplica.

| Field name | Field key | Type | Para qué |
| --- | --- | --- | --- |
| Zona de interés | `contact.zona_interes` | TEXT | Respuesta paso 1 del quiz |
| Horas recuperadas | `contact.horas_recuperadas` | TEXT | Respuesta paso 2 |
| Prioridad declarada | `contact.prioridad` | TEXT | Respuesta paso 3 |
| Fuente | `contact.fuente` | TEXT | Atribución |

Para verlos en la UI: **Settings → Custom Fields → Contact**.

---

## 5. Pipeline / Embudo

**Nombre exacto:** `Nova - Captación Landing`

**Etapas (en orden):**

1. **Lead Nuevo** — entra el contacto sin haber tocado el quiz aún.
2. **Diagnóstico Solicitado** — completó el quiz (la API mueve aquí automático).
3. **Cita Agendada** — disparó el calendario.
4. **Cita Confirmada** — confirmó asistencia (manual o automatizable).
5. **Cita Realizada** — atendida en el local.
6. **Convertido** — compró un protocolo después de la valoración.
7. **Perdido** — no agendó después de seguimiento, o no asistió.

### Si el setup automático falla en este paso, créalo manual

GHL → **Opportunities → Pipelines → New Pipeline**
1. Name: `Nova - Captación Landing`
2. Click "Add Stage" 7 veces y escribir cada nombre tal cual.
3. Save.

---

## 6. Calendario

El widget que ya está embebido en la landing es:

```
Calendar ID:  xVUu1c8gHzw3AooU5lDC
URL widget:   https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC
```

En **Settings → Calendars → [tu calendar] → Edit**:

- **Disponibilidad:** horarios reales del centro estético.
- **Buffer:** 15 min entre citas (mínimo).
- **Confirmación automática:** ON.
- **Custom field obligatorio:** Nombre + Teléfono.
- **Match by phone:** ON (para que si el lead ya existe del quiz, no se duplique).

El widget genera el evento `Appointment Booked` que dispara los workflows #2, #3 y #4.

---

## 7. Workflows manuales (5 flujos)

> **Cómo crear un workflow nuevo en GHL:**
> Sidebar izquierdo → **Automation → Workflows → + New Workflow → Start from Scratch**.
> Después: nombre, click en el `+` para agregar trigger, click en `+` debajo del
> trigger para agregar acciones. Activar el toggle **Publish** (esquina superior
> derecha) cuando esté listo.

### Workflow 1: Bienvenida Lead Landing

**Objetivo:** dar bienvenida instantánea al lead que completó el quiz y empujarlo a agendar.

**Nombre:** `1 - Bienvenida Lead Landing`

#### Trigger

1. Click `+ Add New Trigger`
2. Workflow Trigger → **Contact Tag**
3. **Filters:**
   - Event: `Tag Added`
   - Tag: seleccionar `lead-landing-nova` (después del primer lead aparece en el dropdown; si no, escribirlo a mano y crearlo)
4. Save Trigger

#### Acción 1: Wait 30 segundos

(para evitar race condition con el envío de la API)

1. `+ Add Action` → **Wait**
2. Wait Type: `Time Delay`
3. Duration: `30 Seconds`
4. Save

#### Acción 2: Send WhatsApp (mensaje de bienvenida)

1. `+ Add Action` → **Send SMS** (o **WhatsApp** si tenés Conversation API activada — recomendado)
2. From: tu número GHL conectado
3. To: `{{contact.phone}}`
4. **Message** (copiar tal cual, GHL reemplaza los `{{ }}`):

```
Hola {{contact.first_name}}, soy Nova Aesthetic Professionals ✨

Recibimos tu diagnóstico de piel premium. En menos de 24h te contactamos personalmente para tu invitación VIP.

¿Querés agendar tu valoración ya?
👉 https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC

Cualquier duda, respondé este chat.
```

5. Save

#### Acción 3: Add to Pipeline

1. `+ Add Action` → **Add to Pipeline**
2. Pipeline: `Nova - Captación Landing`
3. Stage: `Diagnóstico Solicitado`
4. Save

#### Acción 4: Wait 24 horas

1. `+ Add Action` → **Wait**
2. Wait Type: `Time Delay`
3. Duration: `24 Hours`
4. Save

#### Acción 5: If/Else — ¿agendó cita?

1. `+ Add Action` → **If/Else Condition**
2. Condition: `Contact Tag` → `Has Tag` → `cita-agendada`
3. **Branch YES (sí agendó):**
   - `+ Add Action` → **End Workflow**
4. **Branch NO (no agendó):**
   - `+ Add Action` → **Send WhatsApp** segundo mensaje:

```
{{contact.first_name}}, te dejé tu invitación VIP ayer y vi que aún no elegiste horario.

Mañana asignamos los últimos cupos premium de la semana. Si querés asegurar el tuyo:
👉 https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC

Si necesitás ayuda para elegir horario, respondé este mismo chat.
```

   - `+ Add Action` → **Add Tag** → `re-engage-1`

#### Publish

Toggle `Publish` arriba a la derecha. ✅

---

### Workflow 2: Cita Agendada Confirmación

**Objetivo:** confirmar la cita al instante de que la persona la agenda y notificar al equipo.

**Nombre:** `2 - Cita Agendada Confirmación`

#### Trigger

1. `+ Add New Trigger` → **Appointment**
2. Event: `Appointment Booked`
3. Filters:
   - Calendar: seleccionar el calendario `xVUu1c8gHzw3AooU5lDC` (aparece como "Booking Calendar" o el nombre que le hayas puesto)
4. Save

#### Acción 1: Add Tag `cita-agendada`

1. `+ Add Action` → **Add Tag**
2. Tag: `cita-agendada`
3. Save

#### Acción 2: Remove Tag `no-agendo`

1. `+ Add Action` → **Remove Tag**
2. Tag: `no-agendo`
3. Save

#### Acción 3: Move Pipeline Stage

1. `+ Add Action` → **Update Opportunity** (o **Move to Pipeline Stage**)
2. Pipeline: `Nova - Captación Landing`
3. Stage: `Cita Agendada`
4. Save

#### Acción 4: Send WhatsApp confirmación

1. `+ Add Action` → **Send WhatsApp / SMS**
2. Message:

```
Listo {{contact.first_name}} 💛

Confirmamos tu valoración premium en Nova:
📅 {{appointment.start_time}}
📍 Ciudad Jardín, Cali

Llegá 5 min antes. Te llegarán recordatorios 24h y 3h antes.

Cualquier cambio, respondé este chat.
```

3. Save

#### Acción 5: Internal Notification (al equipo)

1. `+ Add Action` → **Send Internal Notification** (o email al equipo)
2. To: el email del equipo comercial / dueño
3. Subject: `Nueva cita agendada — {{contact.full_name}}`
4. Body:

```
Cliente: {{contact.full_name}}
Teléfono: {{contact.phone}}
Cita: {{appointment.start_time}}
Zona de interés: {{contact.zona_interes}}
Prioridad: {{contact.prioridad}}
```

5. Save

#### Publish ✅

---

### Workflow 3: Recordatorio 24h antes

**Nombre:** `3 - Recordatorio 24h antes`

#### Trigger

1. `+ Add New Trigger` → **Appointment**
2. Event: `Appointment Status Update`
3. Filter Status: `Confirmed`
4. **Schedule Send:** `24 Hours Before` Appointment Start
5. Save

#### Acción 1: Send WhatsApp

```
Hola {{contact.first_name}} 💛

Recordatorio: mañana a las {{appointment.start_time_short}} es tu valoración premium en Nova.

📍 Ciudad Jardín, Cali — te enviamos la dirección exacta cuando confirmes

¿Necesitás cambiar el horario? Respondé este chat.
```

#### Publish ✅

---

### Workflow 4: Recordatorio 3h antes

**Nombre:** `4 - Recordatorio 3h antes`

#### Trigger

1. `+ Add New Trigger` → **Appointment**
2. Event: `Appointment Status Update`
3. Filter Status: `Confirmed`
4. **Schedule Send:** `3 Hours Before` Appointment Start
5. Save

#### Acción 1: Send WhatsApp

```
{{contact.first_name}}, tu cita en Nova es en 3 horas ✨

📍 [pegar Google Maps link cuando se confirme dirección]
🕐 {{appointment.start_time_short}}

Te esperamos.
```

#### Publish ✅

---

### Workflow 5: Seguimiento No Agendó

**Objetivo:** rescatar al lead que completó el quiz pero no agendó después de 3 días.

**Nombre:** `5 - Seguimiento No Agendó`

#### Trigger

1. `+ Add New Trigger` → **Contact Tag**
2. Event: `Tag Added` → tag `lead-landing-nova`
3. Save

#### Acción 1: Wait 3 días

1. `+ Add Action` → **Wait**
2. Duration: `3 Days`

#### Acción 2: If/Else — ¿agendó?

- Condition: `Contact has tag cita-agendada`
- **Branch YES:** End Workflow
- **Branch NO:**
  - `+ Add Action` → **Send WhatsApp**:

```
Hola {{contact.first_name}}, te escribo desde Nova ✨

Vi que hace unos días pediste tu diagnóstico de piel premium pero no llegaste a agendar. ¿Hay algo en lo que pueda ayudarte?

Si tenías dudas sobre el procedimiento, los precios o los horarios, respondé este chat y te las resuelvo en privado.

Si preferís ver disponibilidad sin compromiso:
👉 https://api.leadconnectorhq.com/widget/booking/xVUu1c8gHzw3AooU5lDC
```

  - `+ Add Action` → **Add Tag** → `seguimiento-72h`
  - `+ Add Action` → **Move to Pipeline Stage** → `Perdido` (provisional, sale de aquí cuando agenden)

#### Publish ✅

---

## 8. Checklist de verificación end-to-end

Antes de pasar a producción, hacer este test con un teléfono de prueba:

- [ ] Variables de entorno cargadas en Vercel y redeploy hecho
- [ ] `POST /api/setup-ghl` ejecutado y responde 200
- [ ] Custom fields visibles en GHL → Settings → Custom Fields
- [ ] Pipeline "Nova - Captación Landing" con 7 etapas en GHL → Pipelines
- [ ] Workflow #1, #2, #3, #4, #5 publicados (toggle "Publish" verde)

**Test del flujo completo:**

1. Completar el quiz en la landing con un nombre + teléfono real (un celular de prueba).
2. Verificar en GHL → Contacts:
   - Aparece el contacto con first_name correcto.
   - Tags aplicados: `lead-landing-nova`, `quiz-completado`, `interesado-X`, `tiempo-X`, `prioridad-X`, `fuente-landing-quiz`, `no-agendo`.
   - Custom fields rellenados (zona_interes, horas_recuperadas, etc.) → si no aparecen, hay que actualizar `api/lead.js` para mandar los IDs de custom field específicos (ver troubleshooting).
3. **30 segundos después** llega el WhatsApp del Workflow #1.
4. **Agendar cita** en el calendar embebido de la landing.
5. Verificar:
   - Tag `cita-agendada` aplicado, `no-agendo` removido (Workflow #2).
   - Movido a stage `Cita Agendada` en el pipeline.
   - WhatsApp de confirmación recibido.
   - Notificación interna recibida.
6. **No-show simulado:** completar el quiz con OTRO teléfono y NO agendar.
   Esperar 24h (o forzar el wait en el workflow). Verificar que se envía el segundo WhatsApp.
7. **3 días sin agendar:** verificar que dispara Workflow #5.

---

## 9. Troubleshooting

### "El custom field no se rellena, solo aparecen tags"

`api/lead.js` aún no envía los `customFields` con sus IDs. Para activarlos:

1. En GHL → Settings → Custom Fields, abrir cada uno y copiar su **ID** (botón "..." → Copy ID).
2. Editar `api/lead.js`, descomentar la sección `customFields`, pegar los IDs:

```js
customFields: [
  { id: '<id-zona>',      value: zone },
  { id: '<id-horas>',     value: time },
  { id: '<id-prioridad>', value: priority },
  { id: '<id-fuente>',    value: source },
],
```

3. Redeploy.

### "El pipeline no se creó vía API (status 207 con error)"

El endpoint `POST /opportunities/pipelines` ha cambiado varias veces. Si falla:

1. Crear el pipeline manualmente como en la sección 5.
2. No hace falta volver a llamar a `setup-ghl.js` — los siguientes leads simplemente no se moverán automáticamente al pipeline (los workflows lo hacen).

### "El bearer token devuelve 401"

- Verificar que el token sea de **Private Integrations**, no de OAuth.
- Verificar que tenga los scopes correctos.
- Si lo rotaste: actualizar `GHL_API_KEY` en Vercel + **redeploy**.

### "Los workflows no disparan"

- Verificar que estén **Published** (toggle verde arriba a la derecha).
- En el workflow, click en `Settings` → `Re-enrollment` → permitir que se dispare múltiples veces si es necesario para testing.
- Revisar el log del workflow: cada workflow tiene un tab "Enrollments" / "Logs" con el detalle de cada ejecución.

### "Los WhatsApp salen como SMS"

GHL envía WhatsApp solo si tenés la **integración de Twilio + WhatsApp Business** o **Conversation API** activadas. Sin eso, se manda como SMS (sigue funcionando, pero el costo es mayor y la entregabilidad menor en Colombia).

---

## 10. Pendientes / mejoras futuras

- [ ] Activar Custom Fields en `api/lead.js` (ver Troubleshooting #1) — los IDs hay que copiarlos manual una vez creados.
- [ ] Implementar reintento con backoff cuando GHL responde 5xx (actualmente solo se loguea).
- [ ] Webhook desde GHL hacia Vercel para cerrar el loop cuando un contacto agenda — útil si en el futuro queremos enviar pixels de conversión a Meta/Google.
- [ ] Conversation AI Bot completo para el empleado digital (Workflow #5 podría ser AI en lugar de un mensaje plano).
- [ ] Integrar notificación interna por **Slack** en lugar de email (más rápida).
