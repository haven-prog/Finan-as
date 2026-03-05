// ─── Format Utilities ────────────────────────────────────────
// Uses native Intl.NumberFormat – safe for all Android locales

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const BRL2 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** R$1.234 (no decimals) */
export const fmt = (n) => BRL.format(Math.abs(Number(n) || 0))

/** R$1.234,56 (with decimals) */
export const fmtDec = (n) => BRL2.format(Number(n) || 0)

/** Today as dd/MM/yyyy */
export const hoje = () => new Date().toLocaleDateString('pt-BR')

/** Capitalize first letter */
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

/** Month name */
export const mesNome = (offsetMonths = 0) => {
  const d = new Date()
  d.setMonth(d.getMonth() + offsetMonths)
  return cap(d.toLocaleString('pt-BR', { month: 'long' }))
}

/** Days remaining in current month */
export const diasRestantes = () => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.max(1, lastDay - now.getDate() + 1)
}

/** Total days in current month */
export const diasNoMes = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

/** Safe parse float from pt-BR string input */
export const parseValor = (s) => {
  if (typeof s === 'number') return s
  return parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0
}
