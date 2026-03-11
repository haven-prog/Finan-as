import { useMemo } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'
import { fmt } from '../../utils.js'
import { MES_ATUAL, MES_ANTERIOR, MES_2_ATRAS, DAYS_IN_MONTH } from '../../constants.js'

function Bar({ pct, color = 'var(--amber)' }) {
  return (
    <div style={{ height:6, background:'var(--s3)', borderRadius:99, overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width .5s' }}/>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:20, padding:'18px 20px' }}>
      <div style={{ fontSize:11, fontWeight:600, color:'var(--sub)', marginBottom:16, letterSpacing:'.03em' }}>{title}</div>
      {children}
    </div>
  )
}

function Row({ label, value, color, sub, noBorder }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'10px 0',
      borderBottom: noBorder ? 'none' : '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--sub)', marginTop:2 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily:'Instrument Serif,serif', fontSize:18, color: color || 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}

export default function IntelPage({ onSimOpen }) {
  const { txs, goals, gfs, totals, gfData, lazerTotal, free } = useFinance()

  const now = new Date()
  const diaAtual = now.getDate()
  const saidas   = useMemo(() => txs.filter(t => t.type==='out'), [txs])

  /* Score */
  const needs  = totals.ent>0 ? saidas.filter(t=>['Essenciais','Aluguel','Saúde','Transporte'].includes(t.cat)).reduce((s,t)=>s+Math.abs(t.amount),0)/totals.ent*100 : 0
  const wants  = totals.ent>0 ? saidas.filter(t=>['Lazer','Alimentação','Assinaturas'].includes(t.cat)).reduce((s,t)=>s+Math.abs(t.amount),0)/totals.ent*100 : 0
  const future = totals.ent>0 ? Math.max(0,100-needs-wants) : 0

  const score = useMemo(() => {
    if (!totals.ent) return 0
    let s = 100
    if (needs>55) s-=20; else if (needs>50) s-=8
    if (future<10) s-=25; else if (future<20) s-=10
    if (wants>35) s-=15
    return Math.max(0, Math.round(s))
  }, [needs, wants, future, totals.ent])

  /* Projeção */
  const taxaDiaria   = diaAtual > 0 ? totals.sai / diaAtual : 0
  const projecaoMes  = taxaDiaria * DAYS_IN_MONTH
  const saldoFim     = totals.ent - projecaoMes

  /* Split por pessoa */
  const split = useMemo(() => {
    let g = 0, a = 0
    saidas.forEach(t => {
      const v = Math.abs(t.amount)
      if (t.owner==='Gabriel') g += v
      else if (t.owner==='Gabi') a += v
      else { g += v/2; a += v/2 }
    })
    return { gabriel:g, gabi:a, total:g+a }
  }, [saidas])

  /* Top categorias */
  const topCats = useMemo(() => {
    const map = {}
    saidas.forEach(t => { map[t.cat] = (map[t.cat]||0) + Math.abs(t.amount) })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,4)
  }, [saidas])

  /* Metas em andamento */
  const metasAtivas = goals.filter(g => g.current < g.target && !g.isParcela)

  /* Alertas */
  const alerts = []
  if (needs > 60)  alerts.push({ cls:'ia-co', txt:`⚠️ Necessidades em ${Math.round(needs)}% da renda — ideal é até 50%.` })
  if (wants > 40)  alerts.push({ cls:'ia-am', txt:`💸 Lazer/extras em ${Math.round(wants)}% — verifique os gastos variáveis.` })
  if (future < 10) alerts.push({ cls:'ia-am', txt:'📉 Você está guardando menos de 10% da renda.' })
  if (saldoFim < 0) alerts.push({ cls:'ia-co', txt:`🚨 Projeção indica saldo negativo de ${fmt(Math.abs(saldoFim))} no fim do mês.` })
  if (score >= 80) alerts.push({ cls:'ia-gr', txt:'✨ Excelente! Finanças equilibradas este mês.' })

  const { ring, grade, cls } = ScoreRing({ score })

  if (!totals.ent) {
    return (
      <div className="page">
        <div className="ph">
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:28, letterSpacing:'-.5px' }}>Inteligência</div>
        </div>
        <div style={{ textAlign:'center', padding:'60px 30px', color:'var(--sub)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📊</div>
          <div style={{ fontSize:14 }}>Adicione lançamentos para ver a análise.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="ph">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:28, letterSpacing:'-.5px' }}>Inteligência</div>
          <button onClick={onSimOpen} style={{
            padding:'7px 14px', borderRadius:20, border:'1px solid var(--border)',
            background:'var(--s1)', color:'var(--sub)', fontSize:12, fontWeight:600, cursor:'pointer',
          }}>Simular</button>
        </div>
      </div>

      <div className="intel">

        {/* Score */}
        <Card title="SCORE DO MÊS">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: alerts.length ? 0 : 0 }}>
            {ring}
            <div>
              <div style={{ fontFamily:'Instrument Serif,serif', fontSize:32, letterSpacing:-1 }}>
                {score}<span style={{ fontSize:16, color:'var(--sub)', marginLeft:2 }}>/100</span>
              </div>
              <div style={{ fontSize:12, color:'var(--sub)', marginTop:2 }}>
                {score >= 80 ? 'Excelente' : score >= 65 ? 'Bom' : score >= 50 ? 'Regular' : 'Atenção'}
              </div>
            </div>
            <div className={`bdg ${cls}`} style={{ marginLeft:'auto' }}>{grade}</div>
          </div>
          {alerts.map((a,i) => (
            <div key={i} className={`ia ${a.cls}`}>{a.txt}</div>
          ))}
        </Card>

        {/* Projeção */}
        <Card title="PROJEÇÃO DO MÊS">
          <Row label="Gasto médio por dia" value={fmt(taxaDiaria)} color="var(--coral)"/>
          <Row label="Projeção total do mês" value={fmt(projecaoMes)} color={projecaoMes > totals.ent ? 'var(--coral)' : 'var(--text)'}/>
          <Row label="Saldo estimado no fim" value={fmt(saldoFim)} color={saldoFim >= 0 ? 'var(--green)' : 'var(--coral)'} noBorder/>
        </Card>

        {/* Regra 50/30/20 */}
        <Card title="DISTRIBUIÇÃO DA RENDA">
          {[
            { label:'Necessidades', pct:needs, ideal:50, color:'var(--blue)' },
            { label:'Lazer & extras', pct:wants, ideal:30, color:'var(--amber)' },
            { label:'Futuro / poupança', pct:future, ideal:20, color:'var(--green)' },
          ].map(({ label, pct, ideal, color }) => (
            <div key={label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</span>
                <span style={{ fontFamily:'Instrument Serif,serif', fontSize:14, color }}>
                  {Math.round(pct)}%
                  <span style={{ fontSize:11, color:'var(--sub)', fontFamily:'DM Sans,sans-serif' }}>
                    {' '}(ideal {ideal}%)
                  </span>
                </span>
              </div>
              <Bar pct={pct} color={Math.round(pct) > ideal * 1.3 ? 'var(--coral)' : color}/>
            </div>
          ))}
        </Card>

        {/* Split por pessoa */}
        {split.total > 0 && (
          <Card title="SPLIT GABRIEL & GABI">
            {[
              { name:'Gabriel', val:split.gabriel, color:'var(--amber)' },
              { name:'Gabi',    val:split.gabi,    color:'var(--coral)' },
            ].map(({ name, val, color }) => {
              const pct = split.total > 0 ? (val / split.total) * 100 : 0
              return (
                <div key={name} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{name}</span>
                    <span style={{ fontFamily:'Instrument Serif,serif', fontSize:16, color }}>
                      {fmt(val)}
                      <span style={{ fontSize:11, color:'var(--sub)', fontFamily:'DM Sans,sans-serif', marginLeft:4 }}>
                        {Math.round(pct)}%
                      </span>
                    </span>
                  </div>
                  <Bar pct={pct} color={color}/>
                </div>
              )
            })}
          </Card>
        )}

        {/* Top categorias */}
        {topCats.length > 0 && (
          <Card title="TOP CATEGORIAS">
            {topCats.map(([cat, val], i) => {
              const pct = totals.sai > 0 ? (val / totals.sai) * 100 : 0
              return (
                <div key={cat} style={{ marginBottom: i < topCats.length-1 ? 14 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{cat}</span>
                    <span style={{ fontFamily:'Instrument Serif,serif', fontSize:16, color:'var(--text)' }}>
                      {fmt(val)}
                      <span style={{ fontSize:11, color:'var(--sub)', fontFamily:'DM Sans,sans-serif', marginLeft:4 }}>
                        {Math.round(pct)}%
                      </span>
                    </span>
                  </div>
                  <Bar pct={pct} color="var(--blue)"/>
                </div>
              )
            })}
          </Card>
        )}

        {/* Previsão metas */}
        {metasAtivas.length > 0 && (
          <Card title="PREVISÃO DAS METAS">
            {metasAtivas.map((g, i) => {
              const falta   = g.target - g.current
              const meses   = g.monthly > 0 ? Math.ceil(falta / g.monthly) : null
              const pct     = Math.round((g.current / g.target) * 100)
              return (
                <div key={g.id} style={{
                  paddingBottom: i < metasAtivas.length-1 ? 14 : 0,
                  marginBottom:  i < metasAtivas.length-1 ? 14 : 0,
                  borderBottom:  i < metasAtivas.length-1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div>
                      <span style={{ marginRight:7 }}>{g.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{g.name}</span>
                    </div>
                    <span style={{ fontSize:12, color:'var(--sub)' }}>
                      {meses != null ? `~${meses}m` : '—'}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Bar pct={pct} color="var(--amber)"/>
                    <span style={{ fontSize:11, color:'var(--sub)', flexShrink:0 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </Card>
        )}

        {/* Evolução 3 meses */}
        <Card title="EVOLUÇÃO">
          {[
            { m: MES_2_ATRAS,  v: Math.round(totals.saldo * .64) },
            { m: MES_ANTERIOR, v: Math.round(totals.saldo * .78) },
            { m: MES_ATUAL,    v: totals.saldo },
          ].map(({ m, v }) => {
            const maxV = Math.round(totals.saldo * 1.1) || 1
            return (
              <div key={m} className="evo">
                <div className="evo-m">{m}</div>
                <div className="evo-bw">
                  <div className="evo-f" style={{
                    width: `${Math.min(100, (Math.abs(v)/maxV)*100)}%`,
                    background: v >= 0 ? 'var(--green)' : 'var(--coral)',
                  }}/>
                </div>
                <div className={`evo-v ${v>=0?'pos':'neg'}`}>{fmt(v)}</div>
              </div>
            )
          })}
        </Card>

      </div>
    </div>
  )
}
