import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'
import { fmt } from '../../utils.js'
import { MES_ATUAL, MES_ANTERIOR, MES_2_ATRAS, DAYS_IN_MONTH } from '../../constants.js'

/* ─ mini progress bar ─ */
function Bar({ pct, color = 'var(--amber)', height = 6 }) {
  return (
    <div style={{ height, background:'var(--s3)', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,Math.round(pct))}%`,
        background:color, borderRadius:99, transition:'width .5s ease' }}/>
    </div>
  )
}

/* ─ Alert chip ─ */
function Alert({ cls, children }) {
  return <div className={`ia ${cls}`} style={{ marginTop:8 }}>{children}</div>
}

/* ─ Stat row ─ */
function Stat({ label, value, color, sub }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>{label}</div>
        {sub && <div style={{ fontSize:10, color:'var(--dim)', marginTop:1 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:700, color: color||'var(--text)' }}>{value}</div>
    </div>
  )
}

export default function IntelPage({ onSimOpen }) {
  const { txs, goals, gfs, totals, gfData, lazerTotal, free } = useFinance()
  const [activeSection, setActive] = useState(null)

  /* ── Cálculos base ── */
  const now = new Date()
  const diaAtual = now.getDate()

  const saidas = useMemo(() => txs.filter(t => t.type==='out'), [txs])
  const entradas = useMemo(() => txs.filter(t => t.type==='in'), [txs])

  /* 50/30/20 */
  const needs  = totals.ent>0 ? saidas.filter(t=>['Essenciais','Aluguel','Saúde','Transporte'].includes(t.cat)).reduce((s,t)=>s+Math.abs(t.amount),0)/totals.ent*100 : 0
  const wants  = totals.ent>0 ? saidas.filter(t=>['Lazer','Alimentação','Assinaturas'].includes(t.cat)).reduce((s,t)=>s+Math.abs(t.amount),0)/totals.ent*100 : 0
  const future = totals.ent>0 ? Math.max(0,100-needs-wants) : 0

  /* Score */
  const score = useMemo(() => {
    let s = 100
    if(needs>55)s-=20; else if(needs>50)s-=8
    if(future<10)s-=25; else if(future<20)s-=10
    if(wants>35)s-=15
    if(totals.ent===0)s=0
    return Math.max(0, Math.round(s))
  }, [needs, wants, future, totals.ent])

  /* Taxa diária de gasto */
  const taxaDiaria = diaAtual>0 ? totals.sai/diaAtual : 0
  const projecaoMes = taxaDiaria * DAYS_IN_MONTH

  /* Saldo projetado no fim do mês */
  const saldoProjetado = totals.ent - projecaoMes

  /* Top categorias */
  const catTotals = useMemo(() => {
    const map = {}
    saidas.forEach(t => { map[t.cat]=(map[t.cat]||0)+Math.abs(t.amount) })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5)
  }, [saidas])

  /* Split Gabriel x Gabi */
  const splitPessoa = useMemo(() => {
    let gabriel = 0, gabi = 0
    saidas.forEach(t => {
      if (t.owner==='Gabriel') gabriel += Math.abs(t.amount)
      else if (t.owner==='Gabi') gabi += Math.abs(t.amount)
      else { gabriel += Math.abs(t.amount)/2; gabi += Math.abs(t.amount)/2 }
    })
    return { gabriel, gabi, total: gabriel + gabi }
  }, [saidas])

  /* Gastos fixos comprometidos (próximos meses - parcelas) */
  const totalParcelasRest = useMemo(() => {
    return goals.filter(g => g.isParcela).reduce((s,g) => {
      const rest = (g.parcelasTotal||0) - (g.parcelasPagas||0)
      return s + rest * (g.parcelaValor||0)
    }, 0)
  }, [goals])

  /* Evolução simulada */
  const evoData = useMemo(() => [
    { m:MES_2_ATRAS,  v:Math.round(totals.saldo*.64), prev:true  },
    { m:MES_ANTERIOR, v:Math.round(totals.saldo*.78), prev:true  },
    { m:MES_ATUAL,    v:totals.saldo,                 prev:false },
  ], [totals])
  const maxEvo = Math.max(...evoData.map(x=>Math.abs(x.v)), 1)

  /* Alertas inteligentes */
  const alertas = useMemo(() => {
    const a = []
    if (!totals.ent) return a
    if (needs > 60)   a.push({ cls:'ia-co', msg:`🚨 Gastos essenciais (${Math.round(needs)}%) muito acima de 50%. Revise fixos.` })
    if (wants > 40)   a.push({ cls:'ia-am', msg:`⚠️ Lazer/alimentação (${Math.round(wants)}%) acima do ideal de 30%.` })
    if (future < 10)  a.push({ cls:'ia-am', msg:`📈 Guardando apenas ${Math.round(future)}% da renda. Meta mínima: 20%.` })
    if (projecaoMes > totals.ent && totals.ent>0) a.push({ cls:'ia-co', msg:`🔴 Ritmo atual projeta gastos de ${fmt(projecaoMes)} — maior que a renda!` })
    if (saldoProjetado > 0 && future > 20) a.push({ cls:'ia-gr', msg:`✅ Projetado economizar ${fmt(saldoProjetado)} este mês. Excelente!` })
    if (totalParcelasRest > totals.ent * 3) a.push({ cls:'ia-am', msg:`💳 Você tem ${fmt(totalParcelasRest)} comprometidos em financiamentos futuros.` })
    if (splitPessoa.gabriel > splitPessoa.gabi * 1.5 && splitPessoa.gabi > 0) a.push({ cls:'ia-bl', msg:`📊 Gabriel gasta ${fmt(splitPessoa.gabriel - splitPessoa.gabi)} a mais que Gabi este mês.` })
    if (splitPessoa.gabi > splitPessoa.gabriel * 1.5 && splitPessoa.gabriel > 0) a.push({ cls:'ia-bl', msg:`📊 Gabi gasta ${fmt(splitPessoa.gabi - splitPessoa.gabriel)} a mais que Gabriel este mês.` })
    if (!a.length && score >= 80) a.push({ cls:'ia-gr', msg:`🏆 Finanças equilibradas! Considerem aumentar aportes nas metas.` })
    return a
  }, [needs, wants, future, projecaoMes, totals, saldoProjetado, totalParcelasRest, splitPessoa, score])

  /* Previsão das metas */
  const metasPrev = useMemo(() => goals.filter(g=>!g.isParcela && g.monthly>0 && g.current<g.target).map(g => {
    const faltam  = g.target - g.current
    const meses   = Math.ceil(faltam / g.monthly)
    const chegada = new Date(now.getFullYear(), now.getMonth() + meses, 1)
    const mesStr  = chegada.toLocaleDateString('pt-BR', { month:'short', year:'numeric' })
    const pct     = Math.min(100,Math.round(g.current/g.target*100))
    return { ...g, meses, mesStr, pct, faltam }
  }), [goals])

  const noData = !totals.ent

  const S = (id) => ({ cursor:'pointer', userSelect:'none' })

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div className="D" style={{ fontSize:23, fontWeight:700, letterSpacing:-1 }}>Inteligência 🧠</div>
          <button onClick={onSimOpen} style={{ background:'var(--amber-d)', border:'1px solid var(--amber)',
            color:'var(--amber)', borderRadius:11, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            E Se? 🧮
          </button>
        </div>
      </div>

      <div className="intel">

        {/* ── SCORE ── */}
        <div className="ic">
          <div className="it">Score do Mês</div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {ScoreRing({ score }).ring}
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:700, letterSpacing:-1, color:'var(--amber)' }}>{score} pts</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
                {score>=80?'Saúde financeira excelente':score>=65?'Bem encaminhados':score>=40?'Atenção necessária':'Situação crítica'}
              </div>
            </div>
          </div>
          {alertas.slice(0,3).map((a,i) => <Alert key={i} cls={a.cls}>{a.msg}</Alert>)}
        </div>

        {/* ── PROJEÇÃO DO MÊS ── */}
        {totals.ent > 0 && (
          <div className="ic">
            <div className="it">📅 Projeção do Mês</div>
            <Stat label={`Taxa diária (${diaAtual} dias)`}  value={`${fmt(taxaDiaria)}/dia`}  color="var(--coral)"/>
            <Stat label="Projeção de gastos total"           value={fmt(projecaoMes)}           color={projecaoMes>totals.ent?'var(--coral)':'var(--amber)'} sub="no ritmo atual"/>
            <Stat label="Saldo projetado no fim do mês"      value={fmt(saldoProjetado)}         color={saldoProjetado>0?'var(--green)':'var(--coral)'}/>
            {totalParcelasRest > 0 && (
              <Stat label="Total comprometido (financiamentos)" value={fmt(totalParcelasRest)} color="var(--amber)" sub="soma de todas as parcelas restantes"/>
            )}
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>
                Comprometimento da renda
              </div>
              <Bar pct={totals.ent>0?projecaoMes/totals.ent*100:0}
                color={projecaoMes>totals.ent?'var(--coral)':projecaoMes/totals.ent>.8?'var(--amber)':'var(--green)'}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <div style={{ fontSize:9.5, color:'var(--muted)' }}>Projetado: {Math.round(totals.ent>0?projecaoMes/totals.ent*100:0)}%</div>
                <div style={{ fontSize:9.5, color:'var(--muted)' }}>Renda: {fmt(totals.ent)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPLIT POR PESSOA ── */}
        {(splitPessoa.gabriel > 0 || splitPessoa.gabi > 0) && (
          <div className="ic">
            <div className="it">👫 Gastos por Pessoa</div>
            {[
              { n:'Gabriel', v:splitPessoa.gabriel, c1:'#f5a623', c2:'#e8820c' },
              { n:'Gabi',    v:splitPessoa.gabi,    c1:'#ff6b6b', c2:'#e84545' },
            ].map(p => {
              const pct = splitPessoa.total>0 ? Math.round(p.v/splitPessoa.total*100) : 50
              return (
                <div key={p.n} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%',
                        background:`linear-gradient(135deg,${p.c1},${p.c2})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:800, color:'#0c0a08' }}>{p.n[0]}</div>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text)' }}>{p.n}</div>
                        <div style={{ fontSize:10, color:'var(--muted)' }}>{pct}% dos gastos</div>
                      </div>
                    </div>
                    <div style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:700, color:p.c1 }}>{fmt(p.v)}</div>
                  </div>
                  <Bar pct={pct} color={p.c1}/>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 50/30/20 ── */}
        <div className="ic">
          <div className="it">Regra 50 / 30 / 20 {noData&&'(sem dados)'}</div>
          {[
            {n:'Necessidades', v:needs,  ideal:50, c:'#60a5fa', icon:'🏠'},
            {n:'Desejos',      v:wants,  ideal:30, c:'#f5a623', icon:'🎮'},
            {n:'Futuro',       v:future, ideal:20, c:'#4ade80', icon:'📈'},
          ].map(r => (
            <div key={r.n} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text)' }}>{r.icon} {r.n}</div>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>ideal {r.ideal}%</div>
                  <div style={{ fontSize:15, fontWeight:800, color: Math.abs(r.v-r.ideal)<5?'var(--green)':r.v>r.ideal?'var(--coral)':'var(--amber)' }}>
                    {Math.round(r.v)}%
                  </div>
                </div>
              </div>
              <Bar pct={r.v} color={r.c}/>
            </div>
          ))}
        </div>

        {/* ── TOP CATEGORIAS ── */}
        {catTotals.length > 0 && (
          <div className="ic">
            <div className="it">💸 Top Categorias de Gasto</div>
            {catTotals.map(([cat,val], i) => {
              const pct = totals.sai>0 ? Math.round(val/totals.sai*100) : 0
              const colors = ['var(--coral)','var(--amber)','var(--blue)','#a78bfa','#4ade80']
              return (
                <div key={cat} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>
                      <span style={{ color:'var(--muted)', marginRight:5 }}>#{i+1}</span>{cat}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ fontSize:10.5, color:'var(--muted)' }}>{pct}%</div>
                      <div style={{ fontFamily:'Fraunces,serif', fontSize:15, fontWeight:700, color:colors[i] }}>{fmt(val)}</div>
                    </div>
                  </div>
                  <Bar pct={pct} color={colors[i]} height={4}/>
                </div>
              )
            })}
          </div>
        )}

        {/* ── EVOLUÇÃO MENSAL ── */}
        <div className="ic">
          <div className="it">📊 Evolução Mensal</div>
          {evoData.map((m,i) => {
            const pos  = m.v >= 0
            const bPct = Math.abs(Math.round((m.v/maxEvo)*100))
            const op   = m.prev ? (.4+i*.2) : 1
            return (
              <div key={m.m} className="evo">
                <div className="evo-m">{m.m}</div>
                <div className="evo-bw">
                  <div className="evo-f" style={{ width:bPct+'%',
                    background:pos?`rgba(74,222,128,${op})`:`rgba(255,107,107,${op})` }}/>
                </div>
                <div className={`evo-v ${pos?'pos':'neg'}`}>{pos?'':'-'}{fmt(Math.abs(m.v))}</div>
              </div>
            )
          })}
          {evoData[2].v>evoData[0].v
            ?<Alert cls="ia-gr">📈 Saldo melhorou {fmt(Math.abs(evoData[2].v-evoData[0].v))} vs 2 meses atrás!</Alert>
            :evoData[2].v<evoData[0].v
              ?<Alert cls="ia-co">📉 Saldo caiu {fmt(Math.abs(evoData[2].v-evoData[0].v))}. Revejam os gastos.</Alert>
              :<Alert cls="ia-bl">📊 Saldo estável. Continue monitorando.</Alert>}
        </div>

        {/* ── PREVISÃO DE METAS ── */}
        {metasPrev.length > 0 && (
          <div className="ic">
            <div className="it">🎯 Previsão das Metas</div>
            {metasPrev.map(g => (
              <div key={g.id} style={{ background:'var(--s2)', border:'1px solid var(--border)',
                borderRadius:13, padding:'11px 13px', marginBottom:9 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:22 }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>Faltam {fmt(g.faltam)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Fraunces,serif', fontSize:17, fontWeight:700, color:'var(--amber)' }}>
                      {g.meses}m
                    </div>
                    <div style={{ fontSize:9.5, color:'var(--muted)' }}>{g.mesStr}</div>
                  </div>
                </div>
                <Bar pct={g.pct} color="var(--amber)"/>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <div style={{ fontSize:9.5, color:'var(--muted)' }}>{g.pct}% concluído</div>
                  <div style={{ fontSize:9.5, color:'var(--muted)' }}>+{fmt(g.monthly)}/mês</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GASTOS FIXOS SAÚDE ── */}
        {gfs.length > 0 && totals.ent > 0 && (
          <div className="ic">
            <div className="it">📌 Saúde dos Gastos Fixos</div>
            <Stat
              label="Gastos fixos / Renda"
              value={`${Math.round(gfs.reduce((s,g)=>s+g.limit,0)/totals.ent*100)}%`}
              color={gfs.reduce((s,g)=>s+g.limit,0)/totals.ent>.6?'var(--coral)':'var(--green)'}
              sub="ideal: abaixo de 50-60%"
            />
            <Stat
              label="Contas ainda a pagar"
              value={`${gfs.filter(g=>(gfData[g.id]?.total||0)<g.limit).length} de ${gfs.length}`}
              color="var(--amber)"
            />
            {gfs.reduce((s,g)=>s+g.limit,0) > totals.ent * .6 && (
              <Alert cls="ia-am">⚠️ Seus gastos fixos comprometem mais de 60% da renda. Considere renegociar algum contrato.</Alert>
            )}
          </div>
        )}

        {noData && (
          <div className="ic" style={{ textAlign:'center', padding:24 }}>
            <div style={{ fontSize:42, marginBottom:12 }}>📊</div>
            <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
              Adicione lançamentos na aba <strong style={{color:'var(--amber)'}}>Gastos</strong> para ver sua análise personalizada aqui.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
