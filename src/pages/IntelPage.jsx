import { useFinance } from '../context/FinanceContext'
import { useComputedFinance } from '../hooks/useComputedFinance'
import { fmt, mesNome } from '../utils/format'

// ─── IntelPage ────────────────────────────────────────────────
export default function IntelPage({ onSimOpen }) {
  const { txs, goals } = useFinance()
  const { totals, needsPct, wantsPct, futurePct, catTotals } = useComputedFinance()

  const MES  = mesNome(0)
  const MES1 = mesNome(-1)
  const MES2 = mesNome(-2)

  // Simulated evolution (last 3 months approx)
  const evoData = [
    { m: MES2, v: totals.saldo * 0.68 },
    { m: MES1, v: totals.saldo * 0.84 },
    { m: MES,  v: totals.saldo },
  ]

  const noData = !totals.ent && !totals.sai

  const rule50 = [
    { label: 'Necessidades', pct: needsPct, target: 50, color: 'var(--blue)', icon: '🏠' },
    { label: 'Desejos',      pct: wantsPct, target: 30, color: 'var(--amber)', icon: '🎮' },
    { label: 'Investimentos',pct: futurePct,target: 20, color: 'var(--green)', icon: '📈' },
  ]

  return (
    <div className="page">
      <div className="ph">
        <div className="D" style={{ fontSize: 23, fontWeight: 700, letterSpacing: -1, marginBottom: 4 }}>Inteligência</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Análise automática do casal</div>
      </div>

      {/* 50/30/20 */}
      <div style={{ margin: '0 20px 14px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 18, padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Regra 50/30/20</div>
        {rule50.map(r => {
          const ok  = Math.abs(r.pct - r.target) < 8
          const bad = r.pct > r.target + 10
          return (
            <div key={r.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{r.icon}</span><span>{r.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>Meta: {r.target}%</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: bad ? 'var(--coral)' : ok ? 'var(--green)' : 'var(--amber)' }}>
                    {Math.round(r.pct)}%
                  </span>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  width: Math.min(100, r.pct) + '%',
                  background: bad ? 'var(--coral)' : ok ? 'var(--green)' : r.color,
                  transition: 'width .7s cubic-bezier(.16,1,.3,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Oportunidade */}
      <div style={{ margin: '0 20px 14px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 18, padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎯 Top Gastos</div>
        {catTotals.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 12 }}>Adicione lançamentos para ver análise.</div>
        )}
        {catTotals.map(([cat, val]) => {
          const pct = totals.sai > 0 ? Math.round((val / totals.sai) * 100) : 0
          const opp = totals.ent > 0 ? ((val * 0.1) / totals.ent * 12 * 100).toFixed(1) : '—'
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '9px 11px', background: 'var(--s2)', borderRadius: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 2 }}>{cat}</div>
                <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>
                  {pct}% das saídas · 10% = {fmt(val * 0.1)}/mês economizado → +{opp}% ao ano
                </div>
              </div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 15, fontWeight: 700, color: 'var(--coral)', flexShrink: 0 }}>
                {fmt(val)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Evolução mensal */}
      <div style={{ margin: '0 20px 14px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 18, padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📊 Evolução do Saldo</div>
        {evoData.map(e => {
          const isPos = e.v >= 0
          return (
            <div key={e.m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{e.m}</div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 700, color: isPos ? 'var(--green)' : 'var(--coral)', letterSpacing: -0.5 }}>
                {isPos ? '' : '−'}{fmt(e.v)}
              </div>
            </div>
          )
        })}
        {evoData[2].v > evoData[0].v
          ? <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--green-d)', border: '1px solid rgba(74,222,128,.25)', fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>📈 Saldo melhorou {fmt(Math.abs(evoData[2].v - evoData[0].v))} vs há 2 meses!</div>
          : <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--coral-d)', border: '1px solid rgba(255,107,107,.25)', fontSize: 11, fontWeight: 700, color: 'var(--coral)' }}>📉 Saldo caiu {fmt(Math.abs(evoData[2].v - evoData[0].v))}. Revejam os gastos!</div>}
      </div>

      {/* Metas progress */}
      {goals.length > 0 && (
        <div style={{ margin: '0 20px 14px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎯 Progresso das Metas</div>
          {goals.map(g => {
            const pct   = Math.min(100, Math.round((g.current / g.target) * 100))
            const meses = g.monthly > 0 ? Math.ceil((g.target - g.current) / g.monthly) : null
            return (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 2 }}>{g.emoji} {g.name}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>{pct}%{meses ? ` · ${meses} meses` : ''}</div>
                  <div style={{ height: 4, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden', marginTop: 5 }}>
                    <div style={{ height: '100%', width: pct + '%', background: 'var(--amber)', borderRadius: 100 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Fraunces,serif', fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>{fmt(g.current)}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>de {fmt(g.target)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Simulador */}
      <div style={{ padding: '0 20px 20px' }}>
        <button
          onClick={onSimOpen}
          style={{ width: '100%', padding: 14, borderRadius: 16, background: 'var(--amber-d)', border: '1.5px solid var(--amber)', color: 'var(--amber)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
          🧮 Abrir Simulador "E Se?"
        </button>
      </div>
    </div>
  )
}
