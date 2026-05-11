# Custom CSS para el calendario de GoHighLevel

## Cómo pegarlo

1. Ir a **GHL → Calendars → seleccionar tu calendario "Citas Nova"**.
2. Editar → tab **"Customizations"** (o **"Style"** según versión).
3. Buscar el campo **"Custom CSS"** o **"Embed CSS"**.
4. Pegar el bloque de abajo entero.
5. Save.

> El widget de GHL queda integrado con el dark/gold de la landing
> Nova, sin el fondo blanco original.

## CSS para pegar

```css
/* ============================================================
   NOVA — Custom CSS para el widget de calendario GHL
   Paleta tomada del logo Nova Aesthetic Professionals.
   ============================================================ */

:root {
  --nova-bg:           #0A0707;
  --nova-bg-elevated:  #1A1310;
  --nova-bg-card:      #2B1F18;
  --nova-bronze-deep:  #3D2B1F;
  --nova-gold:         #C9A164;
  --nova-gold-bright:  #E0BC7E;
  --nova-cream:        #E8D5B7;
  --nova-text:         #F5EDE0;
  --nova-text-2:       #A89788;
  --nova-text-3:       #6B5C4F;
  --nova-border:       rgba(201, 161, 100, 0.30);
  --nova-border-soft:  rgba(201, 161, 100, 0.15);
  --nova-glow:         rgba(201, 161, 100, 0.35);
}

/* Reset del background blanco del body del widget */
body,
html,
#booking,
#booking-form,
.booking-container,
.MuiContainer-root,
.MuiPaper-root {
  background: var(--nova-bg) !important;
  color: var(--nova-text) !important;
  font-family: 'Inter', 'Helvetica', sans-serif !important;
}

/* Cabecera "Citas Nova" + bloque resumen (1 hr / fecha / zona) */
h1, h2, h3, h4, h5, h6,
.booking-title,
.MuiTypography-h1,
.MuiTypography-h2,
.MuiTypography-h3,
.MuiTypography-h4,
.MuiTypography-h5,
.MuiTypography-h6 {
  color: var(--nova-cream) !important;
  font-family: 'Cinzel', 'Cormorant Garamond', serif !important;
  font-weight: 400 !important;
  letter-spacing: 0.005em !important;
}

p, span, label, .MuiTypography-body1, .MuiTypography-body2 {
  color: var(--nova-text) !important;
}

/* Resumen card (1 hr · fecha · zona horaria) */
.summary-card,
.booking-summary,
.MuiCard-root,
.MuiPaper-elevation0,
.MuiPaper-elevation1 {
  background: var(--nova-bg-elevated) !important;
  border: 1px solid var(--nova-border-soft) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 0 1px rgba(201, 161, 100, 0.08), 0 6px 22px rgba(0, 0, 0, 0.45) !important;
}

/* Iconos del summary (reloj, calendario, globo) */
svg, .MuiSvgIcon-root {
  color: var(--nova-gold) !important;
  fill: var(--nova-gold) !important;
}

/* Calendar grid - encabezado de días */
.MuiPickersDay-root,
.day-cell,
.calendar-day {
  color: var(--nova-text-2) !important;
  background: transparent !important;
  border-radius: 50% !important;
  font-family: 'Inter', sans-serif !important;
  transition: background 0.2s ease-out, color 0.2s ease-out, transform 0.16s ease-out !important;
}

/* Día disponible (clickable) */
.MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected),
.day-cell.available {
  color: var(--nova-cream) !important;
  background: rgba(201, 161, 100, 0.08) !important;
}

.MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected):hover,
.day-cell.available:hover {
  background: rgba(201, 161, 100, 0.22) !important;
  color: var(--nova-gold-bright) !important;
  transform: scale(1.06) !important;
}

.MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected):active {
  transform: scale(0.96) !important;
}

/* Día deshabilitado */
.MuiPickersDay-root.Mui-disabled,
.day-cell.disabled {
  color: var(--nova-text-3) !important;
  background: transparent !important;
  opacity: 0.5 !important;
}

/* Día seleccionado */
.MuiPickersDay-root.Mui-selected,
.day-cell.selected {
  background: var(--nova-gold) !important;
  color: #0A0707 !important;
  font-weight: 600 !important;
  box-shadow: 0 0 0 2px var(--nova-glow), 0 4px 16px rgba(201, 161, 100, 0.5) !important;
}

.MuiPickersDay-root.Mui-selected:hover {
  background: var(--nova-gold-bright) !important;
}

/* Día actual (today) */
.MuiPickersDay-today,
.day-cell.today {
  border: 1px solid var(--nova-gold) !important;
  color: var(--nova-gold-bright) !important;
}

/* Flechas navegación mes (chevron izquierda/derecha) */
.MuiIconButton-root,
.month-nav-button {
  background: rgba(201, 161, 100, 0.10) !important;
  color: var(--nova-gold) !important;
  border-radius: 50% !important;
}
.MuiIconButton-root:hover,
.month-nav-button:hover {
  background: rgba(201, 161, 100, 0.22) !important;
}

/* Título "Mayo 2026" */
.MuiPickersCalendarHeader-label,
.month-title {
  color: var(--nova-cream) !important;
  font-family: 'Cinzel', serif !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
}

/* Time slots (08:00 AM, etc) */
.time-slot,
.MuiButton-outlined,
button[class*="TimeSlot"] {
  background: var(--nova-bg-elevated) !important;
  border: 1px solid var(--nova-border) !important;
  color: var(--nova-cream) !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  border-radius: 4px !important;
  padding: 14px 18px !important;
  transition: background 0.25s ease-out, border-color 0.25s ease-out, transform 0.16s ease-out, box-shadow 0.3s ease-out !important;
}

.time-slot:hover,
.MuiButton-outlined:hover,
button[class*="TimeSlot"]:hover {
  background: rgba(201, 161, 100, 0.12) !important;
  border-color: var(--nova-gold) !important;
  color: var(--nova-gold-bright) !important;
  box-shadow: 0 8px 22px rgba(201, 161, 100, 0.18) !important;
}

.time-slot:active {
  transform: scale(0.98) !important;
}

.time-slot.selected,
.MuiButton-outlined.selected {
  background: var(--nova-gold) !important;
  color: #0A0707 !important;
  border-color: var(--nova-gold-bright) !important;
}

/* CTA principal "Continue" / "Confirmar" */
.MuiButton-contained,
button[type="submit"],
.book-btn,
.confirm-btn {
  background: var(--nova-gold) !important;
  color: #0A0707 !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: 0.10em !important;
  text-transform: uppercase !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 16px 38px !important;
  box-shadow: 0 8px 24px rgba(201, 161, 100, 0.25) !important;
  transition: background 0.3s ease-out, transform 0.16s ease-out, box-shadow 0.3s ease-out !important;
}

.MuiButton-contained:hover,
button[type="submit"]:hover,
.book-btn:hover,
.confirm-btn:hover {
  background: var(--nova-gold-bright) !important;
  box-shadow: 0 12px 36px rgba(201, 161, 100, 0.45) !important;
  transform: translateY(-2px) !important;
}

.MuiButton-contained:active {
  transform: scale(0.97) !important;
}

/* Inputs de formulario (nombre, email, teléfono) */
input,
.MuiOutlinedInput-root,
.MuiInputBase-input {
  background: var(--nova-bg-elevated) !important;
  border: 1px solid var(--nova-border-soft) !important;
  color: var(--nova-text) !important;
  border-radius: 3px !important;
  padding: 14px 18px !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.92rem !important;
  transition: border-color 0.25s ease-out, box-shadow 0.25s ease-out !important;
}

input:focus,
.MuiOutlinedInput-root.Mui-focused,
.MuiInputBase-input:focus {
  border-color: var(--nova-gold) !important;
  box-shadow: 0 0 0 3px var(--nova-glow) !important;
  outline: none !important;
}

input::placeholder {
  color: var(--nova-text-3) !important;
}

/* Etiquetas de input */
.MuiFormLabel-root,
label {
  color: var(--nova-text-2) !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.04em !important;
}

/* Dropdown zona horaria */
.MuiSelect-select,
select {
  background: var(--nova-bg-elevated) !important;
  color: var(--nova-text) !important;
  border-color: var(--nova-border-soft) !important;
}

/* Scrollbar dorado del widget */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--nova-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--nova-gold);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--nova-gold-bright);
}

/* Confirmación final / Success state */
.booking-success,
.success-message {
  color: var(--nova-gold-bright) !important;
}
```

## Si GHL no permite custom CSS

Si tu plan de GHL no tiene el campo de custom CSS, contactá a soporte de GHL
o cambiá al plan que lo permita. Como alternativa, podés usar el widget en
modo "iframe embedded" y aplicar el CSS vía postMessage (no soportado por
defecto, requiere customización adicional).

## Verificación

Después de pegar el CSS y guardar:
1. Refrescá la landing.
2. Scrolleá al calendario.
3. Verificá que el widget ya no tenga fondo blanco — debe verse integrado
   con el resto de la página: fondo oscuro, días en oro, time slots con
   borde dorado en hover.

## Selectores a ajustar

Los nombres de clases del widget de GHL pueden cambiar entre versiones.
Si algo no se aplica:
1. Abrí DevTools en el iframe del calendario.
2. Inspeccioná el elemento problemático.
3. Copiá su clase real y agregala al CSS con `!important`.
