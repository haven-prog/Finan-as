import { useFinance } from '../../context/FinanceContext.jsx'
import SyncIndicator from '../ui/SyncIndicator.jsx'
import { fmt } from '../../utils.js'
import { MES_ATUAL, DAYS_LEFT, DAYS_IN_MONTH } from '../../constants.js'

export default function HomePage({ onOpenTx, onTabChange, onEditEmergency, onEditFree, onRealidade, onOpenSync }) {
  const { txs, gfs, goals, saldo, totals, emergency, free } = useFinance()

  const dayBudget = totals.sai > 0 && DAYS_IN_MONTH > 0
    ? Math.max(0, (totals.ent - totals.sai) / DAYS_LEFT)
    : 0

  // Gastos fixos resumo
  const gfSpent = gfs.map(gf => {
    const spent = txs.filter(t => t.gfId === gf.id && t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0)
    const pct   = gf.limit > 0 ? Math.round(spent / gf.limit * 100) : 0
    return { ...gf, spent, pct }
  })
  const totalGfLimit = gfs.reduce((a, g) => a + g.limit, 0)
  const totalGfSpent = gfSpent.reduce((a, g) => a + g.spent, 0)
  const gfPct = totalGfLimit > 0 ? Math.round(totalGfSpent / totalGfLimit * 100) : 0

  // Gasto livre
  const freeTxs = txs.filter(t => t.type === 'out' && !t.gfId && t.amount < 0)
  const freeSpent = freeTxs.reduce((a, t) => a + Math.abs(t.amount), 0)
  const freeLimit = free.limit || 1000
  const freePct   = Math.min(100, Math.round(freeSpent / freeLimit * 100))

  // Reserva
  const emPct = emergency.target > 0 ? Math.min(100, Math.round(emergency.current / emergency.target * 100)) : 0

  // Ultimas 5 txs
  const recent = [...txs].reverse().slice(0, 5)

  return (
    <div className="page">
      {/* Header */}
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="ph-title">Olá, casal 👋</div>
            <div className="ph-sub">{MES_ATUAL} · {DAYS_LEFT} dias restantes</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <SyncIndicator onOpenSync={onOpenSync}/>
          </div>
        </div>
      </div>

      {/* Saldo */}
      <div className="bal">
        <div className="bal-lbl">SALDO DO MÊS</div>
        <div className={`bal-num ${saldo < 0 ? 'neg' : ''}`}>{saldo < 0 ? '−' : ''}{fmt(saldo)}</div>
        <div className="bal-hint">entradas menos saídas em {MES_ATUAL}</div>
        <div className="bal-btns">
          <button className="btn-type btn-in"  onClick={() => onOpenTx('in')}>⬆ Entrada</button>
          <button className="btn-type btn-out" onClick={() => onOpenTx('out')}>⬇ Saída</button>
        </div>
        <div className="bal-row">
          <div className="bal-stat">
            <div className="bal-stat-l">ENTRADAS</div>
            <div className="bal-stat-v c-grn">{fmt(totals.ent)}</div>
          </div>
          <div className="bal-stat">
            <div className="bal-stat-l">SAÍDAS</div>
            <div className="bal-stat-v c-red">{fmt(totals.sai)}</div>
          </div>
          <div className="bal-stat">
            <div className="bal-stat-l">GUARDADO</div>
            <div className="bal-stat-v c-gold">{fmt(totals.saved)}</div>
          </div>
        </div>
      </div>

      {/* Orçamento diário */}
      {dayBudget > 0 && (
        <div className="day-strip">
          <div className="ds-block">
            <div className="ds-num c-gold">{fmt(dayBudget)}</div>
            <div className="ds-lbl">por dia</div>
          </div>
          <div className="ds-div"/>
          <div className="ds-block">
            <div className="ds-num">{DAYS_LEFT}</div>
            <div className="ds-lbl">dias rest.</div>
          </div>
          <div className="ds-div"/>
          <div className="ds-block">
            <div className="ds-num c-sub">{fmt(dayBudget * 7)}</div>
            <div className="ds-lbl">por semana</div>
          </div>
        </div>
      )}

      {/* Gastos Fixos */}
      <div className="sh">
        <div className="sh-t">Gastos Fixos</div>
        <button className="sh-a" onClick={() => onTabChange('fixos')}>Ver todos →</button>
      </div>
      <div className="sum" onClick={() => onTabChange('fixos')}>
        <div className="card card--act">
          <div className="sum-row">
            <div>
              <div className="lbl">PAGO ESTE MÊS</div>
              <div className="sum-big">{fmt(totalGfSpent)}</div>
              <div className="sum-hint">de {fmt(totalGfLimit)} planejado</div>
            </div>
            <div>
              <span className={`badge ${gfPct >= 100 ? 'badge-red' : gfPct >= 80 ? 'badge-gold' : 'badge-grn'}`}>
                {gfPct}%
              </span>
            </div>
          </div>
          <div className="bar-wrap">
            <div className="bar-fill" style={{
              width: gfPct + '%',
              background: gfPct >= 100 ? 'var(--red)' : gfPct >= 80 ? 'var(--gold)' : 'var(--grn)'
            }}/>
          </div>
          <div className="sum-chips">
            {gfSpent.slice(0, 4).map(g => (
              <div key={g.id} className={`chip ${g.pct >= 100 ? 'chip-bad' : g.pct >= 80 ? 'chip-warn' : 'chip-ok'}`}>
                {g.icon} {g.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gasto Livre */}
      <div className="sh">
        <div className="sh-t">Gasto Livre</div>
        <button className="sh-a" onClick={onEditFree}>Editar →</button>
      </div>
      <div className="sum" onClick={onEditFree}>
        <div className="card card--act">
          <div className="sum-row">
            <div>
              <div className="lbl">USADO DO LIMITE</div>
              <div className={`sum-big ${freePct >= 100 ? 'c-red' : ''}`}>{fmt(freeSpent)}</div>
              <div className="sum-hint">limite: {fmt(freeLimit)}</div>
            </div>
            <span className={`badge ${freePct >= 100 ? 'badge-red' : freePct >= 80 ? 'badge-gold' : 'badge-grn'}`}>
              {freePct}%
            </span>
          </div>
          <div className="bar-wrap">
            <div className="bar-fill" style={{
              width: freePct + '%',
              background: freePct >= 100 ? 'var(--red)' : freePct >= 80 ? 'var(--gold)' : 'var(--grn)'
            }}/>
          </div>
          {freePct >= 80 && (
            <div className={`alert ${freePct >= 100 ? 'alert-red' : 'alert-gold'}`}>
              {freePct >= 100 ? '⚠️ Limite atingido!' : '⚠️ Quase no limite — cuidado com novos gastos livres.'}
            </div>
          )}
        </div>
      </div>

      {/* Metas resumo */}
      {goals.length > 0 && (
        <>
          <div className="sh">
            <div className="sh-t">Metas</div>
            <button className="sh-a" onClick={() => onTabChange('metas')}>Ver todas →</button>
          </div>
          <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {goals.slice(0, 3).map(g => {
              const pct = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0
              return (
                <div key={g.id} className="card" style={{ padding:'14px 16px', cursor:'pointer' }}
                  onClick={() => onTabChange('metas')}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:22 }}>{g.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>{g.name}</div>
                      {g.deadline && <div style={{ fontSize:11, color:'var(--sub)' }}>até {g.deadline}</div>}
                    </div>
                    <div style={{ fontFamily:'Instrument Serif,serif', fontSize:16, color: pct >= 100 ? 'var(--grn)' : 'var(--gold)' }}>
                      {pct >= 100 ? '✓' : pct + '%'}
                    </div>
                  </div>
                  <div className="bar-wrap" style={{ height:4 }}>
                    <div className="bar-fill" style={{ width: pct + '%', background: pct >= 100 ? 'var(--grn)' : 'linear-gradient(90deg,var(--gold),#fbbf24)' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Reserva de emergência */}
      <div className="em-card" onClick={onEditEmergency}>
        <div className="em-head">
          <span className="em-label">🛡 Reserva de Emergência</span>
          <span className="em-pct">{emPct}%</span>
        </div>
        <div className="em-num">{fmt(emergency.current)}</div>
        <div className="em-sub">meta: {fmt(emergency.target)}</div>
        <div className="em-bar">
          <div className="em-fill" style={{ width: emPct + '%' }}/>
        </div>
      </div>

      {/* Lançamentos recentes */}
      {recent.length > 0 && (
        <>
          <div className="sh">
            <div className="sh-t">Recentes</div>
            <button className="sh-a" onClick={() => onTabChange('gastos')}>Ver todos →</button>
          </div>
          <div className="recent" style={{ marginBottom:8 }}>
            {recent.map(tx => (
              <div key={tx.id} className="recent-row" onClick={() => onTabChange('gastos')}>
                <div className="recent-ic">{tx.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="recent-name">{tx.name}</div>
                  <div style={{ fontSize:11, color:'var(--sub)' }}>{tx.cat} · {tx.date}</div>
                </div>
                <div className={`recent-amt ${tx.amount < 0 ? 'amt-out' : 'amt-in'}`}>
                  {tx.amount < 0 ? '−' : '+'}{fmt(Math.abs(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modo Realidade */}
      <div style={{ padding:'8px 20px 24px' }}>
        <button onClick={onRealidade} style={{
          width:'100%', padding:'12px', borderRadius:'var(--r-m)',
          background:'none', border:'1.5px dashed var(--line)',
          color:'var(--sub)', fontSize:13, fontWeight:600,
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
        }}>
          ⚖️ Modo Realidade — comparar com banco
        </button>
      </div>
    </div>
  )
}
