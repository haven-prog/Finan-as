import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { useComputedFinance } from '../hooks/useComputedFinance'
import ScoreRing from '../components/ScoreRing'
import { fmt, mesNome } from '../utils/format'

// ─── HomePage ────────────────────────────────────────────────
export default function HomePage({ onOpenTx, onTabChange, onEditEmergency, onEditFree, onModoRealidade }) {
  const { gfs, emergency, free, txs } = useFinance()
  const {
    totals, score, dailyBudget,
    gfData, totalParcelas,
    freeSpent, freeGabriel, freeGabi,
    diasRestantes, diasNoMes,
  } = useComputedFinance()

  const { ring, grade, cls } = ScoreRing({ score })
  const saldoNeg = totals.saldo < 0
  const emPct    = emergency.target > 0
    ? Math.min(100, Math.round((emergency.current / emergency.target) * 100))
    : 0

  // GF summary for home
  const totalGfLimit  = gfs.reduce((s, g) => s + g.limit, 0)
  const totalGfSpent  = gfs.reduce((s, g) => s + (gfData[g.id]?.total || 0), 0)
  const gfPct         = totalGfLimit > 0 ? Math.min(100, Math.round((totalGfSpent / totalGfLimit) * 100)) : 0

  const freeResto = Math.max(0, free.limit - freeSpent)
  const freePct   = free.limit > 0 ? Math.min(100, Math.round((freeSpent / free.limit) * 100)) : 0

  return (
    <div className="page">
      {/* HEADER */}
      <div className="ph">
        <div className="ph-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="avs">
              <div className="av av-g">G</div>
              <div className="av av-a">G</div>
            </div>
            <span className="couple">Gabriel & Gabi</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="ico-btn" onClick={onModoRealidade} title="Modo Realidade">
              <span style={{ fontSize: 15 }}>⚖️</span>
            </div>
            <div className="ico-btn">
              <span style={{ fontSize: 15 }}>🔔</span>
              <div className="notif-dot" />
            </div>
          </div>
        </div>
      </div>

      {/* BALANCE */}
      <div className="bal">
        <div className="bal-lbl">Saldo Real · {mesNome()}</div>
        <div className={`bal-num D ${saldoNeg ? 'negative' : ''}`}>
          {saldoNeg ? '−' : ''}{fmt(totals.saldo)}
        </div>
        <div className="bal-sub">
          {saldoNeg
            ? '⚠️ Gastos maiores que entradas'
            : 'Após todos os comprometimentos'}
        </div>
        <div className="bal-btns">
          <button className="bal-btn bal-btn-in"  onClick={() => onOpenTx('in')}>⬆️ Entrada</button>
          <button className="bal-btn bal-btn-out" onClick={() => onOpenTx('out')}>⬇️ Saída</button>
        </div>
        <div className="bal-stats">
          <div><div className="st-l">Entradas</div><div className="st-v c-gr">{fmt(totals.ent)}</div></div>
          <div><div className="st-l">Saídas</div><div className="st-v c-co">{fmt(totals.sai)}</div></div>
          <div><div className="st-l">Guardado</div><div className="st-v c-am">{fmt(totals.guard)}</div></div>
        </div>
      </div>

      {/* PARCELAS ALERT */}
      {totalParcelas > 0 && (
        <div style={{ margin: '0 20px 10px', background: 'rgba(251,146,60,.08)', border: '1px solid rgba(251,146,60,.3)', borderRadius: 14, padding: '11px 14px', cursor: 'pointer' }}
          onClick={() => onTabChange('fixos')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fb923c', marginBottom: 2 }}>
                📦 Comprometimentos futuros
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                Parcelas dos próximos meses
              </div>
            </div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 17, fontWeight: 700, color: '#fb923c', letterSpacing: -0.5 }}>
              {fmt(totalParcelas)}
            </div>
          </div>
        </div>
      )}

      {/* DAILY BUDGET */}
      <div className="dbc">
        <div className="dbc-block" style={{ background: 'var(--s2)' }}>
          <div className="dbc-num" style={{ color: 'var(--amber)' }}>{diasRestantes}</div>
          <div className="dbc-lbl">dias restantes</div>
        </div>
        <div className="dbc-div" />
        <div className="dbc-block" style={{ background: 'var(--s2)' }}>
          <div className="dbc-num" style={{ color: dailyBudget > 0 ? 'var(--green)' : 'var(--coral)' }}>
            {dailyBudget > 0 ? fmt(dailyBudget) : '—'}
          </div>
          <div className="dbc-lbl">por dia disponível</div>
        </div>
        <div className="dbc-div" />
        <div className="dbc-block" style={{ background: 'var(--s2)' }}>
          <div className="dbc-num" style={{ color: 'var(--blue)' }}>{diasNoMes}</div>
          <div className="dbc-lbl">dias no mês</div>
        </div>
      </div>

      {/* SCORE */}
      <div className="sc" onClick={() => onTabChange('intel')}>
        {ring}
        <div className="sc-body">
          <div className="sc-tit">Score de Saúde Financeira</div>
          <div className="sc-sub">
            {score >= 80 ? 'Parabéns! Finanças equilibradas.' :
             score >= 65 ? 'Quase lá! Pequenos ajustes resolvem.' :
             'Atenção: revise os gastos variáveis.'}
          </div>
        </div>
        <div className={`bdg ${cls}`}>{grade}</div>
      </div>

      {/* GASTOS FIXOS mini */}
      <div className="sch">
        <div className="sct">Gastos Fixos</div>
        <button className="stxt" onClick={() => onTabChange('fixos')}>Ver tudo →</button>
      </div>
      <div style={{ padding: '0 20px', marginBottom: 6 }}>
        <div
          style={{ background: 'var(--s1)', border: `1px solid ${gfPct >= 100 ? 'var(--coral)' : gfPct >= 80 ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 16, padding: '13px 15px', cursor: 'pointer' }}
          onClick={() => onTabChange('fixos')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                {gfs.length} contas · {gfPct}% pago
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Toque para ver cada conta</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 19, fontWeight: 700, letterSpacing: -0.5, color: gfPct >= 100 ? 'var(--coral)' : 'var(--text)' }}>{fmt(totalGfSpent)}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>de {fmt(totalGfLimit)}</div>
            </div>
          </div>
          <div className="pb">
            <div className="pf" style={{ width: gfPct + '%', background: gfPct >= 100 ? '#f87171' : gfPct >= 80 ? 'var(--amber)' : 'var(--blue)' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
            {gfs.slice(0, 5).map(g => {
              const d = gfData[g.id] || { total: 0 }
              const p = g.limit > 0 ? Math.round((d.total / g.limit) * 100) : 0
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: p >= 100 ? 'var(--coral-d)' : p >= 80 ? 'var(--amber-d)' : 'var(--s2)', border: `1px solid ${p >= 100 ? 'var(--coral)' : p >= 80 ? 'var(--amber)' : 'var(--border)'}` }}>
                  <span style={{ fontSize: 12 }}>{g.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: p >= 100 ? 'var(--coral)' : p >= 80 ? 'var(--amber)' : 'var(--muted)' }}>{p}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* GASTO LIVRE UNIFICADO */}
      <div className="sch" style={{ paddingTop: 14 }}>
        <div className="sct">Gasto Livre</div>
        <button className="stxt" onClick={onEditFree}>✏️ Editar</button>
      </div>
      <div style={{ padding: '0 20px', marginBottom: 6 }}>
        <div style={{ background: 'var(--s1)', border: `1px solid ${freePct >= 100 ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 3 }}>Pool do casal 👫</div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 28, fontWeight: 700, letterSpacing: -1, color: freePct >= 100 ? 'var(--coral)' : 'var(--amber)' }}>{fmt(freeResto)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>restam de {fmt(free.limit)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{freePct}% usado</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Gabriel: {fmt(freeGabriel)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Gabi: {fmt(freeGabi)}</div>
            </div>
          </div>
          <div className="pb">
            <div className="pf" style={{ width: freePct + '%', background: freePct >= 100 ? '#f87171' : freePct >= 80 ? 'var(--amber)' : 'var(--green)' }} />
          </div>
          {freePct >= 100 && <div className="gf-tag gf-tag-over" style={{ marginTop: 7 }}>🚨 Limite de lazer ultrapassado!</div>}
          {freePct >= 80 && freePct < 100 && <div className="gf-tag gf-tag-warn" style={{ marginTop: 7 }}>⚠ {freePct}% do limite de lazer usado</div>}
        </div>
      </div>

      {/* EMERGÊNCIA */}
      <div className="emw">
        <div className="emc" onClick={onEditEmergency}>
          <div className="em-top">
            <div className="em-t">🛡 Reserva de Emergência <span className="em-edit">✏️</span></div>
            <div className="em-p">{emPct}%</div>
          </div>
          <div className="em-a">{fmt(emergency.current)}</div>
          <div className="em-s">Meta: {fmt(emergency.target)} · Toque para editar</div>
          <div className="em-bar"><div className="em-fill" style={{ width: emPct + '%' }} /></div>
        </div>
      </div>

      {/* ÚLTIMOS */}
      <div className="sch">
        <div className="sct">Últimos Lançamentos</div>
        <button className="stxt" onClick={() => onTabChange('gastos')}>Ver todos →</button>
      </div>
      <div className="htx">
        {txs.slice(0, 5).map(tx => (
          <div key={tx.id} className="htx-row">
            <div className="htx-ic">{tx.icon}</div>
            <div className="htx-n">{tx.name}</div>
            <div className={`htx-a ${tx.amount < 0 ? 'tn' : 'tp'}`}>
              {tx.amount < 0 ? '−' : '+'}{fmt(Math.abs(tx.amount))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
