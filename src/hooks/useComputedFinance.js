import { useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import { diasRestantes, diasNoMes } from '../utils/format'

// ─── useComputedFinance ───────────────────────────────────────
// All derived/computed values. Uses useMemo so recalcs only when deps change.

export function useComputedFinance() {
  const { txs, gfs, goals } = useFinance()

  const totals = useMemo(() => {
    const ent = txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0)
    const sai = Math.abs(txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0))
    const saldo = ent - sai
    const guard = Math.max(0, saldo)
    return { ent, sai, saldo, guard }
  }, [txs])

  const score = useMemo(() => {
    if (!totals.ent) return 0
    let s = 100
    const needPct = (totals.sai / totals.ent) * 100
    const savePct = (totals.guard / totals.ent) * 100
    if (needPct > 55) s -= 20; else if (needPct > 50) s -= 8
    if (savePct < 10) s -= 25; else if (savePct < 20) s -= 10
    return Math.max(10, Math.round(s))
  }, [totals])

  const dailyBudget = useMemo(() => {
    const dr = diasRestantes()
    return dr > 0 && totals.saldo > 0 ? Math.floor(totals.saldo / dr) : 0
  }, [totals.saldo])

  // Spending per gf, split by person
  const gfData = useMemo(() => {
    const map = {}
    gfs.forEach(g => { map[g.id] = { total: 0, gabriel: 0, gabi: 0, txs: [] } })
    txs
      .filter(t => t.type === 'out' && t.gfId && map[t.gfId])
      .forEach(t => {
        const v = Math.abs(t.amount)
        map[t.gfId].total += v
        if (t.owner === 'Gabriel') map[t.gfId].gabriel += v
        else map[t.gfId].gabi += v
        map[t.gfId].txs.push(t)
      })
    return map
  }, [txs, gfs])

  // Future commitments from parcelas (months ahead)
  const parcelas = useMemo(() => {
    return gfs
      .filter(g => g.parcelaConfig)
      .map(g => {
        const pc = g.parcelaConfig
        const remaining = pc.totalParcelas - pc.parcelaAtual
        return {
          gfId:     g.id,
          name:     g.name,
          icon:     g.icon,
          valor:    g.limit,
          remaining,
          total:    remaining * g.limit,
          metaId:   pc.metaId,
        }
      })
  }, [gfs])

  const totalParcelas = useMemo(
    () => parcelas.reduce((s, p) => s + p.total, 0),
    [parcelas]
  )

  // Free spending (lazer txs, all owners combined)
  const freeSpent = useMemo(
    () => txs
      .filter(t => t.type === 'out' && t.cat === 'Lazer')
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    [txs]
  )

  const freeGabriel = useMemo(
    () => txs
      .filter(t => t.owner === 'Gabriel' && t.type === 'out' && t.cat === 'Lazer')
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    [txs]
  )

  const freeGabi = useMemo(
    () => txs
      .filter(t => t.owner === 'Gabi' && t.type === 'out' && t.cat === 'Lazer')
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    [txs]
  )

  // Category totals for intel
  const catTotals = useMemo(() => {
    const map = {}
    txs.filter(t => t.type === 'out').forEach(t => {
      map[t.cat] = (map[t.cat] || 0) + Math.abs(t.amount)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [txs])

  const needsPct = useMemo(() => totals.ent > 0
    ? txs.filter(t => t.type === 'out' && ['Essenciais', 'Saúde', 'Transporte'].includes(t.cat))
        .reduce((s, t) => s + Math.abs(t.amount), 0) / totals.ent * 100
    : 0, [txs, totals.ent])

  const wantsPct = useMemo(() => totals.ent > 0
    ? txs.filter(t => t.type === 'out' && ['Lazer', 'Alimentação'].includes(t.cat))
        .reduce((s, t) => s + Math.abs(t.amount), 0) / totals.ent * 100
    : 0, [txs, totals.ent])

  const futurePct = useMemo(() => Math.max(0, 100 - needsPct - wantsPct), [needsPct, wantsPct])

  return {
    totals, score, dailyBudget,
    gfData, parcelas, totalParcelas,
    freeSpent, freeGabriel, freeGabi,
    catTotals, needsPct, wantsPct, futurePct,
    diasRestantes: diasRestantes(),
    diasNoMes: diasNoMes(),
  }
}
