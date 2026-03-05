import { useState, useMemo } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import { fmt } from '../../utils.js'

const TABS = [
  { id:'habito',   icon:'🍔', label:'Hábito' },
  { id:'invest',   icon:'📈', label:'Investimento' },
  { id:'parcela',  icon:'💳', label:'Parcela' },
  { id:'renda',    icon:'💰', label:'Renda Extra' },
]

function MiniBar({ pct, color, label, value }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:12, fontWeight:700, color }}>{value}</div>
      </div>
      <div style={{ height:6, background:'var(--s3)', borderRadius:99 }}>
        <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color,
          borderRadius:99, transition:'width .4s ease' }}/>
      </div>
    </div>
  )
}

function GoalCard({ goal, extraMensal, highlight }) {
  if (!goal) return null
  const faltam    = Math.max(0, goal.target - goal.current)
  const mBase     = goal.monthly || 0
  const mNovo     = mBase + extraMensal
  const mesesBase = mBase > 0 ? Math.ceil(faltam / mBase) : null
  const mesesNovo = mNovo > 0 ? Math.ceil(faltam / mNovo) : null
  const ganho     = mesesBase && mesesNovo ? mesesBase - mesesNovo : null

  return (
    <div style={{ background: highlight ? 'var(--green-d)' : 'var(--s2)',
      border:`1px solid ${highlight ? 'var(--green)' : 'var(--border)'}`,
      borderRadius:14, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ fontSize:22 }}>{goal.emoji}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{goal.name}</div>
          <div style={{ fontSize:10, color:'var(--muted)' }}>
            {fmt(goal.current)} de {fmt(goal.target)} ({Math.round(goal.current/goal.target*100)}%)
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ textAlign:'center', padding:'8px', background:'var(--s3)', borderRadius:10 }}>
          <div style={{ fontSize:9, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Ritmo atual</div>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:700, color:'var(--muted)', marginTop:2 }}>
            {mesesBase ? `${mesesBase}m` : '∞'}
          </div>
        </div>
        <div style={{ textAlign:'center', padding:'8px', background: ganho ? 'rgba(74,222,128,.15)' : 'var(--s3)', borderRadius:10 }}>
          <div style={{ fontSize:9, color: ganho ? 'var(--green)' : 'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Novo ritmo</div>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:700, color: ganho ? 'var(--green)' : 'var(--muted)', marginTop:2 }}>
            {mesesNovo ? `${mesesNovo}m` : '∞'}
          </div>
        </div>
      </div>
      {ganho > 0 && (
        <div style={{ marginTop:8, padding:'7px 10px', background:'rgba(74,222,128,.1)',
          borderRadius:9, fontSize:12, fontWeight:700, color:'var(--green)', textAlign:'center' }}>
          🚀 Antecipa em <strong>{ganho} {ganho === 1 ? 'mês' : 'meses'}!</strong>
        </div>
      )}
    </div>
  )
}

/* ── Aba Hábito ── */
function TabHabito({ goals, totals }) {
  const [corte,    setCorte]    = useState(200)
  const [categoria, setCat]    = useState('iFood / Delivery')
  const [goalIdx,   setGoalIdx] = useState(0)

  const opcoes = ['iFood / Delivery','Assinaturas','Lazer / Balada','Roupas','Café / Padaria','Cigarros / Bebidas']
  const saving = Math.round(corte * 0.85) // 85% de conversão real
  const goal   = goals.filter(g => !g.isParcela)[goalIdx] || goals[0]

  return (
    <div>
      <div style={{ marginBottom:14 }}>
        <label className="fl-lbl">Que categoria você quer cortar?</label>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:12 }}>
          {opcoes.map(o => (
            <button key={o} onClick={() => setCat(o)}
              style={{ padding:'5px 11px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                border:`1px solid ${categoria===o?'var(--amber)':'var(--border)'}`,
                background:categoria===o?'var(--amber-d)':'var(--s2)',
                color:categoria===o?'var(--amber)':'var(--muted)' }}>
              {o}
            </button>
          ))}
        </div>

        <label className="fl-lbl">Reduzir em quanto por mês?</label>
        <div style={{ padding:'4px 0 2px' }}>
          <input type="range" min="50" max="800" step="50" value={corte}
            onChange={e => setCorte(+e.target.value)}
            style={{ width:'100%', accentColor:'var(--amber)' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--muted)', marginBottom:12 }}>
          <span>R$50</span>
          <span style={{ fontSize:16, fontWeight:800, color:'var(--amber)' }}>− {fmt(corte)}/mês</span>
          <span>R$800</span>
        </div>
      </div>

      {/* Impacto anual */}
      <div style={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px', marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>💥 Impacto real</div>
        <MiniBar pct={100} color="var(--coral)"   label="Saída atual"    value={`−${fmt(corte)}/mês`}/>
        <MiniBar pct={85}  color="var(--amber)"   label="Economia real"  value={`+${fmt(saving)}/mês`}/>
        <MiniBar pct={70}  color="var(--green)"   label="Em 12 meses"    value={fmt(saving * 12)}/>
        {totals.ent > 0 && (
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:8, borderTop:'1px solid var(--border)', paddingTop:8 }}>
            Representa <strong style={{ color:'var(--amber)' }}>{Math.round(corte/totals.ent*100)}%</strong> da sua renda mensal
          </div>
        )}
      </div>

      {goals.length > 0 && (
        <>
          <label className="fl-lbl">Ver impacto na meta:</label>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {goals.filter(g=>!g.isParcela).map((g, i) => (
              <button key={g.id} onClick={() => setGoalIdx(i)}
                style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                  border:`1px solid ${goalIdx===i?'var(--amber)':'var(--border)'}`,
                  background:goalIdx===i?'var(--amber-d)':'var(--s2)',
                  color:goalIdx===i?'var(--amber)':'var(--muted)' }}>
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
          <GoalCard goal={goals.filter(g=>!g.isParcela)[goalIdx]} extraMensal={saving} highlight={saving>0}/>
        </>
      )}
    </div>
  )
}

/* ── Aba Investimento ── */
function TabInvest() {
  const [capital,  setCapital]  = useState(1000)
  const [mensal,   setMensal]   = useState(500)
  const [anos,     setAnos]     = useState(10)
  const [taxa,     setTaxa]     = useState(0.8) // % ao mês (SELIC ~10,5%aa ≈ 0.84%/mês)

  const TAXAS = [
    { n:'Poupança (5%aa)',   v: 0.41 },
    { n:'CDB (10%aa)',       v: 0.80 },
    { n:'Tesouro Selic',     v: 0.84 },
    { n:'Renda variável (12%aa)', v: 0.95 },
  ]

  const result = useMemo(() => {
    const r = taxa / 100
    const n = anos * 12
    const fv = capital * Math.pow(1+r, n) + mensal * ((Math.pow(1+r,n) - 1) / r)
    const investido = capital + mensal * n
    const juros = fv - investido
    return { fv, investido, juros }
  }, [capital, mensal, anos, taxa])

  return (
    <div>
      <label className="fl-lbl">Taxa de rendimento</label>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {TAXAS.map(t => (
          <button key={t.n} onClick={() => setTaxa(t.v)}
            style={{ padding:'5px 10px', borderRadius:20, fontSize:10.5, fontWeight:700, cursor:'pointer',
              border:`1px solid ${taxa===t.v?'var(--green)':'var(--border)'}`,
              background:taxa===t.v?'var(--green-d)':'var(--s2)',
              color:taxa===t.v?'var(--green)':'var(--muted)' }}>
            {t.n}
          </button>
        ))}
      </div>

      <div className="g2">
        <div>
          <label className="fl-lbl">Capital inicial (R$)</label>
          <input className="fl-inp" type="number" inputMode="numeric"
            value={capital} onChange={e => setCapital(+e.target.value||0)}/>
        </div>
        <div>
          <label className="fl-lbl">Aporte mensal (R$)</label>
          <input className="fl-inp" type="number" inputMode="numeric"
            value={mensal} onChange={e => setMensal(+e.target.value||0)}/>
        </div>
      </div>

      <label className="fl-lbl">Período: <strong style={{color:'var(--amber)'}}>{anos} anos</strong></label>
      <input type="range" min="1" max="30" step="1" value={anos}
        onChange={e => setAnos(+e.target.value)}
        style={{ width:'100%', accentColor:'var(--amber)', marginBottom:12 }}/>

      <div style={{ background:'linear-gradient(135deg,var(--green-d),rgba(74,222,128,.03))',
        border:'1px solid var(--green)', borderRadius:14, padding:'14px 16px', marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(74,222,128,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>
          📈 Resultado em {anos} anos
        </div>
        <div style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:700, color:'var(--green)', letterSpacing:-1, marginBottom:4 }}>
          {fmt(result.fv)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
          <div style={{ background:'rgba(0,0,0,.2)', borderRadius:9, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'var(--muted)', fontWeight:700, textTransform:'uppercase' }}>Você investiu</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:700, color:'var(--muted)', marginTop:2 }}>{fmt(result.investido)}</div>
          </div>
          <div style={{ background:'rgba(74,222,128,.1)', borderRadius:9, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'var(--green)', fontWeight:700, textTransform:'uppercase' }}>Juros ganhos</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:700, color:'var(--green)', marginTop:2 }}>{fmt(result.juros)}</div>
          </div>
        </div>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:10, textAlign:'center' }}>
          Os juros representam <strong style={{color:'var(--green)'}}>{Math.round(result.juros/result.investido*100)}%</strong> a mais do que você investiu 🎉
        </div>
      </div>
    </div>
  )
}

/* ── Aba Parcela ── */
function TabParcela() {
  const [valor,    setValor]  = useState(3000)
  const [parcelas, setParc]   = useState(12)
  const [juros,    setJuros]  = useState(2.5) // % ao mês

  const totalComJuros = useMemo(() => {
    if (juros === 0) return valor
    const r = juros/100
    return valor * (r * Math.pow(1+r,parcelas)) / (Math.pow(1+r,parcelas)-1) * parcelas
  }, [valor, parcelas, juros])

  const valorParcela = totalComJuros / parcelas
  const totalJuros   = totalComJuros - valor
  const perdaAnual   = (totalJuros / valor * 100)

  return (
    <div>
      <div style={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px', marginBottom:12 }}>
        <div style={{ fontSize:10.5, color:'var(--muted)', fontWeight:700, marginBottom:10 }}>
          ⚠️ Este simulador mostra o <strong style={{color:'var(--coral)'}}>custo real</strong> de uma compra parcelada com juros.
        </div>
      </div>

      <div className="g2">
        <div>
          <label className="fl-lbl">Valor do produto (R$)</label>
          <input className="fl-inp" type="number" inputMode="numeric"
            value={valor} onChange={e => setValor(+e.target.value||0)}/>
        </div>
        <div>
          <label className="fl-lbl">Número de parcelas</label>
          <input className="fl-inp" type="number" inputMode="numeric"
            value={parcelas} onChange={e => setParc(Math.max(1,+e.target.value||1))}/>
        </div>
      </div>

      <label className="fl-lbl">Juros ao mês: <strong style={{color:'var(--coral)'}}>{juros}%</strong></label>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
        {[0, 1.5, 2.5, 3.5, 5, 7].map(j => (
          <button key={j} onClick={() => setJuros(j)}
            style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
              border:`1px solid ${juros===j?'var(--coral)':'var(--border)'}`,
              background:juros===j?'var(--coral-d)':'var(--s2)',
              color:juros===j?'var(--coral)':'var(--muted)' }}>
            {j === 0 ? 'Sem juros' : `${j}%/mês`}
          </button>
        ))}
      </div>

      <div style={{ background: totalJuros > 0 ? 'var(--coral-d)' : 'var(--green-d)',
        border:`1px solid ${totalJuros>0?'var(--coral)':'var(--green)'}`,
        borderRadius:14, padding:'14px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
          <div style={{ background:'rgba(0,0,0,.2)', borderRadius:9, padding:'8px 10px', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'var(--muted)', fontWeight:700, textTransform:'uppercase' }}>Parcela</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:700, color:'var(--coral)', marginTop:2 }}>
              {fmt(valorParcela)}/mês
            </div>
          </div>
          <div style={{ background:'rgba(0,0,0,.2)', borderRadius:9, padding:'8px 10px', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'var(--muted)', fontWeight:700, textTransform:'uppercase' }}>Você paga</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:700, color:totalJuros>0?'var(--coral)':'var(--green)', marginTop:2 }}>
              {fmt(totalComJuros)}
            </div>
          </div>
        </div>
        {totalJuros > 0 ? (
          <div style={{ fontSize:12, fontWeight:700, color:'var(--coral)', textAlign:'center' }}>
            Você paga <strong>{fmt(totalJuros)} a mais</strong> em juros ({perdaAnual.toFixed(0)}% do valor original!)
          </div>
        ) : (
          <div style={{ fontSize:12, fontWeight:700, color:'var(--green)', textAlign:'center' }}>
            ✅ Sem juros — OK parcelar neste caso!
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Aba Renda Extra ── */
function TabRenda({ goals, totals }) {
  const [extra,   setExtra]   = useState(500)
  const [destino, setDestino] = useState('metas')
  const [goalIdx, setGoalIdx] = useState(0)

  const goal = goals[goalIdx]

  const DESTINOS = [
    { id:'metas',    label:'📈 Metas',           desc: 'Acelerar seu objetivo' },
    { id:'invest',   label:'🏦 Investimento',     desc: 'Juros compostos' },
    { id:'reserva',  label:'🛡 Reserva',          desc: 'Segurança financeira' },
    { id:'dividas',  label:'💸 Quitar dívidas',   desc: 'Eliminar juros' },
  ]

  return (
    <div>
      <label className="fl-lbl">Se vocês ganhassem <strong style={{color:'var(--green)'}}>{fmt(extra)}</strong> extra...</label>
      <input type="range" min="200" max="5000" step="100" value={extra}
        onChange={e => setExtra(+e.target.value)}
        style={{ width:'100%', accentColor:'var(--green)', marginBottom:12 }}/>

      <label className="fl-lbl">Onde aplicar?</label>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {DESTINOS.map(d => (
          <div key={d.id} onClick={() => setDestino(d.id)}
            style={{ padding:'10px 12px', borderRadius:13, cursor:'pointer',
              border:`1.5px solid ${destino===d.id?'var(--green)':'var(--border)'}`,
              background:destino===d.id?'var(--green-d)':'var(--s2)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:destino===d.id?'var(--green)':'var(--text)', marginBottom:2 }}>{d.label}</div>
            <div style={{ fontSize:10, color:'var(--muted)' }}>{d.desc}</div>
          </div>
        ))}
      </div>

      {destino === 'metas' && goals.filter(g=>!g.isParcela).length > 0 && (
        <>
          <label className="fl-lbl">Impacto na meta:</label>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
            {goals.filter(g=>!g.isParcela).map((g, i) => (
              <button key={g.id} onClick={() => setGoalIdx(i)}
                style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                  border:`1px solid ${goalIdx===i?'var(--green)':'var(--border)'}`,
                  background:goalIdx===i?'var(--green-d)':'var(--s2)',
                  color:goalIdx===i?'var(--green)':'var(--muted)' }}>
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
          <GoalCard goal={goals.filter(g=>!g.isParcela)[goalIdx]} extraMensal={extra} highlight/>
        </>
      )}

      {destino === 'invest' && (
        <div style={{ background:'var(--green-d)', border:'1px solid var(--green)', borderRadius:14, padding:'14px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(74,222,128,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Em 10 anos (CDB 10%aa)</div>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:700, color:'var(--green)', letterSpacing:-1 }}>
            {fmt(extra * ((Math.pow(1.008,120)-1)/0.008))}
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
            Investindo {fmt(extra)}/mês durante 10 anos com juros compostos
          </div>
        </div>
      )}

      {destino === 'reserva' && (
        <div style={{ background:'var(--blue-d)', border:'1px solid rgba(96,165,250,.5)', borderRadius:14, padding:'14px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(96,165,250,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Reserva de emergência</div>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:700, color:'var(--blue)', letterSpacing:-1 }}>
            {Math.ceil(extra > 0 ? (totals.sai * 6) / extra : 0)} meses
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
            Para atingir 6 meses de despesas ({fmt(totals.sai * 6)})
          </div>
        </div>
      )}

      {destino === 'dividas' && (
        <div style={{ background:'var(--amber-d)', border:'1px solid var(--amber)', borderRadius:14, padding:'14px' }}>
          <div style={{ fontSize:11, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
            💡 Quitar dívidas = rendimento garantido da taxa que você pagava.
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.6 }}>
            Dívida de cartão com 3%/mês: quitar é como ter <strong style={{color:'var(--amber)'}}>36% de rendimento ao ano</strong> garantido — melhor que qualquer investimento.
          </div>
        </div>
      )}
    </div>
  )
}

/* ── MAIN MODAL ── */
export default function SimModal({ onClose }) {
  const { goals, totals } = useFinance()
  const [tab, setTab] = useState('habito')

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxHeight:'90vh', overflowY:'auto' }}>
        <div className="sh-hd"/>
        <div className="sh-t">Simulador "E Se?" 🧮</div>
        <div className="sh-s">Explore cenários e tome decisões mais inteligentes.</div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flexShrink:0, padding:'7px 13px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
                border:`1.5px solid ${tab===t.id?'var(--amber)':'var(--border)'}`,
                background:tab===t.id?'var(--amber-d)':'var(--s2)',
                color:tab===t.id?'var(--amber)':'var(--muted)' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab==='habito'  && <TabHabito  goals={goals} totals={totals}/>}
        {tab==='invest'  && <TabInvest/>}
        {tab==='parcela' && <TabParcela/>}
        {tab==='renda'   && <TabRenda   goals={goals} totals={totals}/>}

        <button className="btn-s" style={{ marginTop:16 }} onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}
