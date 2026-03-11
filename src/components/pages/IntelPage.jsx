import { useMemo } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'
import { fmt }  from '../../utils.js'
import { MES_ATUAL, MES_ANTERIOR, MES_2_ATRAS } from '../../constants.js'

function Card({ title, children }) {
  return (
    <div className="ic">
      <div className="ic-title">{title}</div>
      {children}
    </div>
  )
}

function StatRow({ label, sub, value, color }) {
  return (
    <div className="stat-row">
      <div>
        <div className="stat-lbl">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <div className="stat-val" style={{ color: color || 'var(--txt)' }}>{value}</div>
    </div>
  )
}

function BarRow({ label, value, pct, color, ideal }) {
  return (
    <div className="bar-row">
      <div className="bar-top">
        <div className="bar-label">{label}</div>
        <div className="bar-val" style={{ color }}>{value}</div>
      </div>
      <div className="bar-wrap" style={{ height:6 }}>
        <div className="bar-fill" style={{ width: Math.min(100,pct) + '%', background: color }}/>
      </div>
      {ideal && (
        <div style={{ fontSize:10, color:'var(--sub)', marginTop:4 }}>ideal: {ideal}</div>
      )}
    </div>
  )
}

export default function IntelPage({ onSimOpen }) {
  const { txs, gfs, goals, totals, emergency } = useFinance()

  const score = useMemo(() => {
    let s = 0
    if (totals.ent > 0) {
      const savePct = totals.saved / totals.ent
      if (savePct >= 0.20) s += 30
      else if (savePct >= 0.10) s += 20
      else if (savePct > 0) s += 10
    }
    const emMonths = totals.sai > 0 ? emergency.current / totals.sai : 0
    if (emMonths >= 6) s += 25
    else if (emMonths >= 3) s += 15
    else if (emMonths > 0) s += 7
    if (goals.length > 0) s += 15
    const paid = goals.filter(g => g.isParcela && g.parcelasPagas > 0).length
    if (paid > 0) s += 10
    if (totals.ent > 0 && totals.sai / totals.ent < 0.8) s += 20
    return Math.min(100, s)
  }, [totals, emergency, goals])

  const { ring, grade, cls } = ScoreRing({ score })

  const byOwner = useMemo(() => {
    const G = txs.filter(t => t.owner === 'Gabriel' && t.amount < 0).reduce((a,t) => a + Math.abs(t.amount), 0)
    const A = txs.filter(t => t.owner === 'Gabi'    && t.amount < 0).reduce((a,t) => a + Math.abs(t.amount), 0)
    const total = G + A || 1
    return { G, A, total }
  }, [txs])

  const byCat = useMemo(() => {
    const map = {}
    txs.filter(t => t.amount < 0).forEach(t => {
      map[t.cat] = (map[t.cat] || 0) + Math.abs(t.amount)
    })
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,5)
  }, [txs])

  const ruleOf50 = useMemo(() => {
    if (totals.ent === 0) return null
    const needs = txs.filter(t => ['Essenciais','Alimentação','Saúde','Transporte'].includes(t.cat) && t.amount < 0).reduce((a,t) => a + Math.abs(t.amount), 0)
    const wants = txs.filter(t => ['Lazer','Outros'].includes(t.cat) && t.amount < 0).reduce((a,t) => a + Math.abs(t.amount), 0)
    const saves = totals.saved
    return {
      needs: { val: needs, pct: needs / totals.ent * 100 },
      wants: { val: wants, pct: wants / totals.ent * 100 },
      saves: { val: saves, pct: saves / totals.ent * 100 },
    }
  }, [txs, totals])

  const goalsForecast = useMemo(() => {
    return goals.filter(g => !g.isParcela && g.monthly > 0).map(g => {
      const faltam = Math.max(0, g.target - g.current)
      const meses  = g.monthly > 0 ? Math.ceil(faltam / g.monthly) : null
      const pct    = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0
      return { ...g, faltam, meses, pct }
    })
  }, [goals])

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="ph-title">Inteligência</div>
            <div className="ph-sub">Análise do seu dinheiro</div>
          </div>
          <button onClick={onSimOpen} style={{
            padding:'7px 13px', borderRadius:99,
            background:'var(--gold-a)', border:'1px solid rgba(240,165,0,.2)',
            color:'var(--gold)', fontSize:12, fontWeight:700,
          }}>
            🧮 Simular
          </button>
        </div>
      </div>

      <div className="intel">
        {/* Score */}
        <div className="score-card">
          {ring}
          <div className="sc-text">
            <div className="sc-title">Nota {grade} — Saúde Financeira</div>
            <div className="sc-sub">
              {score >= 80 ? 'Excelente! Vocês estão no caminho certo.' :
               score >= 65 ? 'Bom! Ainda há espaço para melhorar.' :
               score >= 50 ? 'Regular. Foque na reserva e nas metas.' :
               'Atenção. Revise gastos e crie metas.'}
            </div>
          </div>
          <span className={`badge ${cls}`}>{grade}</span>
        </div>

        {/* Resumo do mês */}
        <Card title="📊 RESUMO DO MÊS">
          <StatRow label="Entradas" value={fmt(totals.ent)} color="var(--grn)"/>
          <StatRow label="Saídas"   value={fmt(totals.sai)} color="var(--red)"/>
          <StatRow label="Guardado" value={fmt(totals.saved)}
            color={totals.saved >= 0 ? 'var(--gold)' : 'var(--red)'}/>
          {totals.ent > 0 && (
            <StatRow label="Taxa de poupança"
              value={Math.round(totals.saved / totals.ent * 100) + '%'}
              color={totals.saved / totals.ent >= 0.2 ? 'var(--grn)' : 'var(--gold)'}
              sub="meta ideal: ≥20%"/>
          )}
        </Card>

        {/* Regra 50/30/20 */}
        {ruleOf50 && (
          <Card title="⚖️ REGRA 50/30/20">
            <BarRow label="Necessidades" value={fmt(ruleOf50.needs.val)}
              pct={ruleOf50.needs.pct} color="var(--blu)" ideal="50%"/>
            <BarRow label="Desejos" value={fmt(ruleOf50.wants.val)}
              pct={ruleOf50.wants.pct} color="var(--gold)" ideal="30%"/>
            <BarRow label="Poupança" value={fmt(ruleOf50.saves.val)}
              pct={ruleOf50.saves.pct} color="var(--grn)" ideal="20%"/>
          </Card>
        )}

        {/* Por pessoa */}
        <Card title="👫 GASTOS POR PESSOA">
          <div className="bar-row">
            <div className="bar-top">
              <div className="bar-label">Gabriel</div>
              <div className="bar-val" style={{ color:'var(--gold)' }}>{fmt(byOwner.G)}</div>
            </div>
            <div className="bar-wrap" style={{ height:6 }}>
              <div className="bar-fill" style={{ width: (byOwner.G / byOwner.total * 100) + '%', background:'var(--gold)' }}/>
            </div>
          </div>
          <div className="bar-row">
            <div className="bar-top">
              <div className="bar-label">Gabi</div>
              <div className="bar-val" style={{ color:'var(--red)' }}>{fmt(byOwner.A)}</div>
            </div>
            <div className="bar-wrap" style={{ height:6 }}>
              <div className="bar-fill" style={{ width: (byOwner.A / byOwner.total * 100) + '%', background:'var(--red)' }}/>
            </div>
          </div>
        </Card>

        {/* Categorias */}
        {byCat.length > 0 && (
          <Card title="🏷 TOP CATEGORIAS">
            {byCat.map(([cat, val]) => {
              const pct = totals.sai > 0 ? val / totals.sai * 100 : 0
              return <BarRow key={cat} label={cat} value={fmt(val)} pct={pct} color="var(--sub)"/>
            })}
          </Card>
        )}

        {/* Metas forecast */}
        {goalsForecast.length > 0 && (
          <Card title="🎯 PREVISÃO DAS METAS">
            {goalsForecast.map(g => (
              <div key={g.id} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ fontSize:16 }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>{g.name}</div>
                      <div style={{ fontSize:11, color:'var(--sub)' }}>
                        {g.meses ? `${g.meses} ${g.meses===1?'mês':'meses'}` : '∞'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily:'Instrument Serif,serif', fontSize:14, color:'var(--gold)' }}>{g.pct}%</div>
                </div>
                <div className="bar-wrap" style={{ height:4 }}>
                  <div className="bar-fill" style={{ width: g.pct + '%', background:'linear-gradient(90deg,var(--gold),#fbbf24)' }}/>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Reserva */}
        <Card title="🛡 RESERVA DE EMERGÊNCIA">
          <StatRow label="Atual" value={fmt(emergency.current)} color="var(--grn)"/>
          <StatRow label="Meta"  value={fmt(emergency.target)}/>
          {emergency.target > 0 && (
            <StatRow label="Cobertura"
              value={`${Math.min(100,Math.round(emergency.current / emergency.target * 100))}%`}
              sub={`${totals.sai > 0 ? (emergency.current / totals.sai).toFixed(1) : '—'} meses de despesas`}/>
          )}
        </Card>
      </div>
    </div>
  )
}
