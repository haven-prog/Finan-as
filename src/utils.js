// ─── UTILITIES ───────────────────────────────────────────────
import { AUTO_CAT, CATS_OUT } from './constants.js'

/** Currency formatter using Intl API */
export const fmt = n =>
  'R$' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(n))

/** Today's date formatted as DD/MM */
export const hoje = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

/** Next ID for array of items */
export const nextId = arr => Math.max(0, ...arr.map(x => x.id || 0)) + 1

/**
 * Auto-categorize based on description text.
 * Returns a CATS_OUT id string, or null if no match.
 */
export function autoCat(text) {
  if (!text || text.length < 3) return null
  const lower = text.toLowerCase()
  for (const [key, catId] of Object.entries(AUTO_CAT)) {
    if (lower.includes(key)) return catId
  }
  return null
}

/** Color helper for percentage thresholds */
export function pctColor(pct) {
  if (pct >= 100) return 'var(--coral)'
  if (pct >= 80)  return 'var(--amber)'
  return 'var(--green)'
}

/** Clamp a value between min and max */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))
