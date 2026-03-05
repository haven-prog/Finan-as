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
    const np = (totals.sai/totals.ent)*100, sp = (totals.guard/totals.ent)*100
    if(np>55)s-=20; else if(np>50)s-=8
    if(sp<10)s-=25; else if(sp<20)s-=10
    return Math.max(10, Math.round(s))
  }, [totals])

  const dailyBudget = DAYS_LEFT>0&&totals.saldo>0 ? Math.floor(totals.saldo/DAYS_LEFT) : 0
  const { ring, grade, cls } = ScoreRing({ score })
  const saldoNeg = totals.saldo < 0

  // GF summary
  const totalGfLimit = gfs.reduce((s,g) => s+g.limit, 0)
  const totalGfSpent = gfs.reduce((s,g) => s+(gfData[g.id]?.total||0), 0)
  const gfPct = totalGfLimit>0 ? Math.min(100,Math.round((totalGfSpent/totalGfLimit)*100)) : 0

  // Unified gasto livre
  const freeLimit = free.limit || 1000
  const freeResto = Math.max(0, freeLimit - lazerTotal)
  const freePct   = freeLimit>0 ? Math.min(100,Math.round((lazerTotal/freeLimit)*100)) : 0

  const emPct = emergency.target>0 ? Math.min(100,Math.round((emergency.current/emergency.target)*100)) : 0

  const pendingNotifs = notifs.filter(n => !n.read)

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div style={{display:'flex',alignItems:'center'}}>
            <div className="avs">
              <div className="av av-g">G</div>
              <div className="av av-a">G</div>
            </div>
            <span className="couple">Gabriel & Gabi</span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {pendingNotifs.length > 0 && (
              <div onClick={() => onTabChange('notifs')} style={{cursor:'pointer',position:'relative'}}>
                <div className="ico-btn">
                  <span style={{fontSize:15}}>🎉</span>
                  <div className="notif-dot"/>
                </div>
              </div>
            )}
            <SyncIndicator onOpenSync={onOpenSync}/>
          </div>
        </div>
      </div>

      {/* SALDO */}
      <div className="bal">
        <div className="bal-lbl">Saldo Real · {MES_ATUAL}</div>
        <div className={`bal-num D ${saldoNeg?'negative':''}`}>
          {saldoNeg?'−':''}{fmt(totals.saldo)}
        </div>
        <div className="bal-sub">
          {saldoNeg?'⚠️ Gastos maiores que entradas':'Após todos os comprometimentos'}
        </div>
        <div className="bal-btns">
          <button className="bal-btn bal-btn-in"  onClick={() => onOpenTx('in')}>⬆️ Entrada</button>
          <button className="bal-btn bal-btn-out" onClick={() => onOpenTx('out')}>⬇️ Saída</button>
        </div>
        <div className="bal-stats">
          <div><div className="st-l">Entradas</div><div className="st-v c-gr">{fmt(totals.ent)}</div></div>
          <div><div className="st-l">Saídas</div>  <div className="st-v c-co">{fmt(totals.sai)}</div></div>
          <div><div className="st-l">Guardado</div><div className="st-v c-am">{fmt(totals.guard)}</div></div>
        </div>
      </div>

      {/* MODO REALIDADE button */}
      <div style={{padding:'0 20px 10px',display:'flex',gap:8}}>
        <button onClick={onRealidade} style={{
          flex:1, padding:'10px 14px', borderRadius:14, background:'var(--s2)',
          border:'1px solid var(--border)', color:'var(--muted)', fontSize:12.5,
          fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'center', gap:7, transition:'.18s',
        }}>
          ⚖️ Modo Realidade
        </button>
      </div>

      {/* ORÇAMENTO DIÁRIO */}
      <div className="dbc">
        <div className="dbc-block" style={{background:'var(--s2)'}}>
          <div className="dbc-num" style={{color:'var(--amber)'}}>{DAYS_LEFT}</div>
          <div className="dbc-lbl">dias restantes</div>
        </div>
        <div className="dbc-div"/>
        <div className="dbc-block" style={{background:'var(--s2)'}}>
          <div className="dbc-num" style={{color:dailyBudget>0?'var(--green)':'var(--coral)'}}>
            {dailyBudget>0 ? fmt(dailyBudget) : '—'}
          </div>
          <div className="dbc-lbl">por dia disponível</div>
        </div>
        <div className="dbc-div"/>
        <div className="dbc-block" style={{background:'var(--s2)'}}>
          <div className="dbc-num" style={{color:'var(--blue)'}}>{DAYS_IN_MONTH}</div>
          <div className="dbc-lbl">dias no mês</div>
        </div>
      </div>

      {/* SCORE */}
      <div className="sc" onClick={() => onTabChange('intel')}>
        {ring}
        <div className="sc-body">
          <div className="sc-tit">Score de Saúde Financeira</div>
          <div className="sc-sub">
            {score>=80?'Parabéns! Finanças equilibradas.':
             score>=65?'Quase lá! Pequenos ajustes resolvem.':
             'Atenção: revise os gastos variáveis.'}
          </div>
        </div>
        <div className={`bdg ${cls}`}>{grade}</div>
      </div>

      {/* GASTOS FIXOS — resumo */}
      <div className="sch">
        <div className="sct">Gastos Fixos</div>
        <button className="stxt" onClick={() => onTabChange('fixos')}>Ver tudo →</button>
      </div>
      <div style={{padding:'0 20px',marginBottom:6}}>
        <div style={{background:'var(--s1)',border:`1px solid ${gfPct>=100?'var(--coral)':gfPct>=80?'var(--amber)':'var(--border)'}`,borderRadius:16,padding:'13px 15px',cursor:'pointer'}}
          onClick={() => onTabChange('fixos')}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div>
              <div style={{fontSize:12.5,fontWeight:700,color:'var(--text)',marginBottom:2}}>{gfs.length} contas fixas · {gfPct}% pago</div>
              <div style={{fontSize:10,color:'var(--muted)'}}>Toque para ver cada conta</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Fraunces,serif',fontSize:19,fontWeight:700,letterSpacing:-.5,color:gfPct>=100?'var(--coral)':'var(--text)'}}>{fmt(totalGfSpent)}</div>
              <div style={{fontSize:9,color:'var(--muted)'}}>de {fmt(totalGfLimit)}</div>
            </div>
          </div>
          <div className="pb"><div className="pf" style={{width:gfPct+'%',background:gfPct>=100?'#f87171':gfPct>=80?'var(--amber)':'var(--blue)'}}/></div>
          <div style={{display:'flex',gap:6,marginTop:9,flexWrap:'wrap'}}>
            {gfs.slice(0,5).map(g => {
              const p = g.limit>0 ? Math.round(((gfData[g.id]?.total||0)/g.limit)*100) : 0
              return (
                <div key={g.id} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:20,
                  background:p>=100?'var(--coral-d)':p>=80?'var(--amber-d)':'var(--s2)',
                  border:`1px solid ${p>=100?'var(--coral)':p>=80?'var(--amber)':'var(--border)'}`}}>
                  <span style={{fontSize:12}}>{g.icon}</span>
                  <span style={{fontSize:10,fontWeight:700,color:p>=100?'var(--coral)':p>=80?'var(--amber)':'var(--muted)'}}>{p}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* GASTO LIVRE UNIFICADO */}
      <div className="sch" style={{paddingTop:14}}>
        <div className="sct">Gasto Livre do Casal</div>
        <button className="stxt" onClick={onEditFree}>✏️ Editar</button>
      </div>
      <div style={{padding:'0 20px 4px'}}>
        <div className="fc" style={{gridColumn:'1/-1',maxWidth:'100%'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div className="fav" style={{background:'linear-gradient(135deg,#f5a623,#ff6b6b)',color:'#fff'}}>👫</div>
            <div style={{flex:1}}>
              <div className="fl">Gabriel & Gabi</div>
              <div className="fa" style={{color:'var(--amber)'}}>{fmt(freeResto)}</div>
              <div className="fs">restam de {fmt(freeLimit)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Fraunces,serif',fontSize:13,fontWeight:700,color:'var(--coral)'}}>{fmt(lazerTotal)}</div>
              <div style={{fontSize:9.5,color:'var(--muted)'}}>gasto em lazer</div>
            </div>
          </div>
          <div className="pb"><div className="pf" style={{width:freePct+'%',background:`linear-gradient(90deg,var(--amber),var(--coral))`}}/></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
            <div style={{fontSize:9,color:'var(--muted)',fontWeight:600}}>{freePct}% usado</div>
            {freePct >= 80 && <div style={{fontSize:9.5,fontWeight:700,color:freePct>=100?'var(--coral)':'var(--amber)'}}>
              {freePct>=100?'🚨 Limite atingido!':'⚠ Quase no limite'}
            </div>}
          </div>
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
          <div className="em-bar"><div className="em-fill" style={{width:emPct+'%'}}/></div>
        </div>
      </div>

      {/* ÚLTIMOS LANÇAMENTOS */}
      <div className="sch">
        <div className="sct">Últimos Lançamentos</div>
        <button className="stxt" onClick={() => onTabChange('gastos')}>Ver todos →</button>
      </div>
      <div className="htx">
        {txs.slice(0,4).map(tx => (
          <div key={tx.id} className="htx-row">
            <div className="htx-ic">{tx.icon}</div>
            <div className="htx-n">{tx.name}</div>
            <div className={`htx-a ${tx.amount<0?'tn':'tp'}`}>
              {tx.amount<0?'−':'+'}{fmt(Math.abs(tx.amount))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
