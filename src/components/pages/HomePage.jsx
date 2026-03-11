import { useMemo } from 'react'
import SyncIndicator from '../ui/SyncIndicator.jsx'
import { useFinance } from '../../context/FinanceContext.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'
import { fmt } from '../../utils.js'
import { DAYS_LEFT, DAYS_IN_MONTH, MES_ATUAL } from '../../constants.js'

export default function HomePage({ onOpenTx, onTabChange, onEditEmergency, onEditFree, onRealidade, onOpenSync }) {
  const { txs, gfs, gfData, totals, emergency, free, lazerTotal, notifs } = useFinance()

  const score = useMemo(() => {
    if (!totals.ent) return 0
    let s = 100
    const np = (totals.sai / totals.ent) * 100
    const sp = (totals.guard / totals.ent) * 100
    if (np > 55) s -= 20; else if (np > 50) s -= 8
    if (sp < 10) s -= 25; else if (sp < 20) s -= 10
    return Math.max(10, Math.round(s))
  }, [totals])

  const dailyBudget = DAYS_LEFT > 0 && totals.saldo > 0 ? Math.floor(totals.saldo / DAYS_LEFT) : 0
  const { ring, grade, cls } = ScoreRing({ score })
  const saldoNeg = totals.saldo < 0

  // Gastos fixos
  const totalGfLimit = gfs.reduce((s, g) => s + g.limit, 0)
  const totalGfSpent = gfs.reduce((s, g) => s + (gfData[g.id]?.total || 0), 0)
  const gfPct = totalGfLimit > 0 ? Math.min(100, Math.round((totalGfSpent / totalGfLimit) * 100)) : 0

  // Gasto livre
  const freeLimit = free.limit || 1000
  const freeResto = Math.max(0, freeLimit - lazerTotal)
  const freePct   = freeLimit > 0 ? Math.min(100, Math.round((lazerTotal / freeLimit) * 100)) : 0

  // Reserva
  const emPct = emergency.target > 0 ? Math.min(100, Math.round((emergency.current / emergency.target) * 100)) : 0

  const pendingNotifs = notifs.filter(n => !n.read)

  return (
    <div className="page">

      {/* ── HEADER ── */}
      <div className="ph">
        <div className="ph-row">
          <div style={{ display:'flex', alignItems:'center' }}>
            <div className="avs">
              <div className="av av-g">G</div>
              <div className="av av-a">G</div>
            </div>
            <span className="couple">Gabriel & Gabi</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {pendingNotifs.length > 0 && (
              <div className="ico-btn" style={{ cursor:'pointer' }}
                onClick={() => onTabChange('notifs')}>
                <span style={{ fontSize:14 }}>🎉</span>
                <div className="notif-dot"/>
              </div>
            )}
            <SyncIndicator onOpenSync={onOpenSync}/>
          </div>
        </div>
      </div>

      {/* ── SALDO ── */}
      <div className="bal">
        <div className="bal-lbl">{MES_ATUAL}</div>
        <div className={`bal-num${saldoNeg ? ' negative' : ''}`}>
          {saldoNeg ? '−' : ''}{fmt(totals.saldo)}
        </div>
        <div className="bal-sub">
          {saldoNeg ? '⚠️ Gastos maiores que entradas' : 'Saldo disponível'}
        </div>
        <div className="bal-btns">
          <button className="bal-btn bal-btn-in"  onClick={() => onOpenTx('in')}>
            ↑ Entrada
          </button>
          <button className="bal-btn bal-btn-out" onClick={() => onOpenTx('out')}>
            ↓ Saída
          </button>
        </div>
        <div className="bal-stats">
          <div className="bal-stat">
            <div className="st-l">Entradas</div>
            <div className="st-v c-gr">{fmt(totals.ent)}</div>
          </div>
          <div className="bal-stat">
            <div className="st-l">Saídas</div>
            <div className="st-v c-co">{fmt(totals.sai)}</div>
          </div>
          <div className="bal-stat">
            <div className="st-l">Guardado</div>
            <div className="st-v c-am">{fmt(totals.guard)}</div>
          </div>
        </div>
      </div>

      {/* ── ORÇAMENTO DIÁRIO ── */}
      <div className="dbc">
        <div className="dbc-block">
          <div className="dbc-num" style={{ color:'var(--amber)' }}>{DAYS_LEFT}</div>
          <div className="dbc-lbl">dias restantes</div>
        </div>
        <div className="dbc-div"/>
        <div className="dbc-block">
          <div className="dbc-num" style={{ color: dailyBudget > 0 ? 'var(--green)' : 'var(--coral)' }}>
            {dailyBudget > 0 ? fmt(dailyBudget) : '—'}
          </div>
          <div className="dbc-lbl">por dia</div>
        </div>
        <div className="dbc-div"/>
        <div className="dbc-block">
          <div className="dbc-num" style={{ color:'var(--blue)' }}>{DAYS_IN_MONTH}</div>
          <div className="dbc-lbl">dias no mês</div>
        </div>
      </div>

      {/* ── SCORE ── */}
      <div className="sc" onClick={() => onTabChange('intel')}>
        {ring}
        <div className="sc-body">
          <div className="sc-tit">Saúde Financeira</div>
          <div className="sc-sub">
            {score >= 80 ? 'Parabéns! Finanças equilibradas.'
             : score >= 65 ? 'Quase lá — pequenos ajustes.'
             : 'Atenção: revise os gastos.'}
          </div>
        </div>
        <div className={`bdg ${cls}`}>{grade}</div>
      </div>

      {/* ── GASTOS FIXOS ── */}
      <div className="sch">
        <div className="sct">Gastos Fixos</div>
        <button className="stxt" onClick={() => onTabChange('fixos')}>Ver tudo →</button>
      </div>
      <div className="sum-card" onClick={() => onTabChange('fixos')}>
        <div className="sum-row">
          <div>
            <div className="sum-label">Pago este mês</div>
            <div className="sum-title">{fmt(totalGfSpent)}</div>
            <div className="sum-sub">de {fmt(totalGfLimit)} comprometidos</div>
          </div>
          <div className="sum-right">
            <div className="sum-badge"
              style={gfPct >= 100 ? { background:'var(--coral-d)', color:'var(--coral)' }
                   : gfPct >= 80  ? { background:'var(--amber-d)', color:'var(--amber)' }
                   : { background:'var(--green-d)', color:'var(--green)' }}>
              {gfPct}%
            </div>
          </div>
        </div>
        <div className="pb">
          <div className="pf" style={{
            width: gfPct + '%',
            background: gfPct >= 100 ? 'var(--coral)' : gfPct >= 80 ? 'var(--amber)' : 'var(--green)'
          }}/>
        </div>
        {/* chips por conta */}
        {gfs.length > 0 && (
          <div className="gf-chips" style={{ marginTop:12 }}>
            {gfs.slice(0, 6).map(g => {
              const p = g.limit > 0 ? Math.round(((gfData[g.id]?.total || 0) / g.limit) * 100) : 0
              const state = p >= 100 ? 'over' : p >= 80 ? 'warn' : 'ok'
              return (
                <div key={g.id} className={`gf-chip ${state}`}>
                  {g.icon} {g.name}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── GASTO LIVRE ── */}
      <div className="sch">
        <div className="sct">Gasto Livre</div>
        <button className="stxt" onClick={onEditFree}>Editar</button>
      </div>
      <div className="sum-card" onClick={onEditFree} style={{ cursor:'pointer' }}>
        <div className="sum-row">
          <div>
            <div className="sum-label">Lazer do casal</div>
            <div className="sum-title" style={{ color: freeResto > 0 ? 'var(--text)' : 'var(--coral)' }}>
              {fmt(freeResto)}
            </div>
            <div className="sum-sub">restam de {fmt(freeLimit)}</div>
          </div>
          <div className="sum-right">
            <div className="sum-badge"
              style={freePct >= 100 ? { background:'var(--coral-d)', color:'var(--coral)' }
                   : freePct >= 80  ? { background:'var(--amber-d)', color:'var(--amber)' }
                   : undefined}>
              {freePct}%
            </div>
          </div>
        </div>
        <div className="pb">
          <div className="pf" style={{
            width: freePct + '%',
            background: `linear-gradient(90deg, var(--amber), var(--coral))`
          }}/>
        </div>
        {freePct >= 100 && (
          <div className="ia ia-co" style={{ marginTop:10 }}>🚨 Limite atingido este mês.</div>
        )}
        {freePct >= 80 && freePct < 100 && (
          <div className="ia ia-am" style={{ marginTop:10 }}>⚠️ Só {fmt(freeResto)} restam.</div>
        )}
      </div>

      {/* ── RESERVA ── */}
      <div className="emw">
        <div className="emc" onClick={onEditEmergency}>
          <div className="em-top">
            <div className="em-t">🛡 Reserva de Emergência</div>
            <div className="em-p">{emPct}%</div>
          </div>
          <div className="em-a">{fmt(emergency.current)}</div>
          <div className="em-s">Meta: {fmt(emergency.target)}</div>
          <div className="em-bar"><div className="em-fill" style={{ width:emPct+'%' }}/></div>
        </div>
      </div>

      {/* ── ÚLTIMOS LANÇAMENTOS ── */}
      <div className="sch">
        <div className="sct">Últimos Lançamentos</div>
        <button className="stxt" onClick={() => onTabChange('gastos')}>Ver todos →</button>
      </div>
      <div className="htx">
        {txs.slice(0, 5).map((tx, i) => (
          <div key={tx.id} className="htx-row"
            style={{
              borderRadius: txs.slice(0,5).length === 1 ? 16
                : i === 0 ? '16px 16px 4px 4px'
                : i === Math.min(txs.length, 5) - 1 ? '4px 4px 16px 16px'
                : 4,
              borderTop: i > 0 ? '1px solid transparent' : undefined,
            }}>
            <div className="htx-ic">{tx.icon}</div>
            <div className="htx-n">{tx.name}</div>
            <div className={`htx-a ${tx.amount < 0 ? 'tn' : 'tp'}`}>
              {tx.amount < 0 ? '−' : '+'}{fmt(Math.abs(tx.amount))}
            </div>
          </div>
        ))}
        {txs.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 20px', color:'var(--sub)', fontSize:13 }}>
            Nenhum lançamento ainda.<br/>
            <span style={{ color:'var(--amber)' }}>Toque em + para começar.</span>
          </div>
        )}
      </div>

      {/* ── MODO REALIDADE ── */}
      <div style={{ padding:'0 22px 20px' }}>
        <button onClick={onRealidade} style={{
          width:'100%', padding:'12px', borderRadius:14,
          background:'var(--s1)', border:'1px solid var(--border)',
          color:'var(--sub)', fontSize:13, fontWeight:600,
          cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'center', gap:8, transition:'.15s',
        }}>
          ⚖️ Modo Realidade — conferir com o banco
        </button>
      </div>

    </div>
  )
}
