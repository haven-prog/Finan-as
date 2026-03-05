import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import GFModal from '../modals/GFModal.jsx'
import Confirm from '../modals/Confirm.jsx'
import { fmt } from '../../utils.js'

export default function GastosFixosPage({ onOpenTxForGf }) {
  const { txs, gfs, goals, gfData, dispatch } = useFinance()
  const [exp,    setExp]    = useState(null)
  const [editGf, setEditGf] = useState(null)
  const [newGf,  setNewGf]  = useState(false)
  const [delGf,  setDelGf]  = useState(null)

  const totalLimit = gfs.reduce((s,g) => s+g.limit, 0)
  const totalGasto = gfs.reduce((s,g) => s+(gfData[g.id]?.total||0), 0)
  const totalResto = totalLimit - totalGasto

  function saveGf(g) {
    const newGfs = editGf ? gfs.map(x => x.id===g.id ? {...x,...g} : x) : [...gfs, g]
    dispatch({ type:'SET_GFS', gfs:newGfs })
    setEditGf(null); setNewGf(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div className="D" style={{fontSize:23,fontWeight:700,letterSpacing:-1}}>Gastos Fixos</div>
          <button onClick={() => setNewGf(true)}
            style={{background:'var(--amber-d)',border:'1px solid var(--amber)',color:'var(--amber)',
              borderRadius:11,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
            ＋ Novo
          </button>
        </div>
      </div>

      <div className="gf-summary">
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Total Orçado</div>
          <div className="gf-sum-val c-am">{fmt(totalLimit)}</div>
          <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>{gfs.length} contas</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Total Pago</div>
          <div className="gf-sum-val" style={{color:totalGasto>totalLimit?'var(--coral)':'var(--text)'}}>{fmt(totalGasto)}</div>
          <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>{totalLimit>0?Math.round((totalGasto/totalLimit)*100):0}% do orçado</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">A Pagar</div>
          <div className="gf-sum-val" style={{color:totalResto>0?'var(--coral)':'var(--green)'}}>{fmt(Math.max(0,totalResto))}</div>
          <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>{gfs.filter(g=>(gfData[g.id]?.total||0)<g.limit).length} pendentes</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Gabriel</div>
          <div className="gf-sum-val c-am">{fmt(gfs.filter(g=>g.owner==='Gabriel'||g.owner==='Ambos').reduce((s,g)=>s+(gfData[g.id]?.gabriel||0),0))}</div>
          <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>Gabi: {fmt(gfs.filter(g=>g.owner==='Gabi'||g.owner==='Ambos').reduce((s,g)=>s+(gfData[g.id]?.gabi||0),0))}</div>
        </div>
      </div>

      <div className="gf-list">
        {gfs.map(g => {
          const d    = gfData[g.id] || {total:0,gabriel:0,gabi:0,txs:[]}
          const pct  = g.limit > 0 ? Math.round((d.total/g.limit)*100) : 0
          const fc   = pct>=100?'#f87171':pct>=80?'var(--amber)':g.color
          const open = exp===g.id
          const resto= g.limit - d.total
          const linkedGoal = goals.find(go => go.id===g.goalId)

          return (
            <div key={g.id} className={`gf ${open?'exp':''} ${pct>=100?'over':''}`}>
              <div className="gf-head" onClick={() => setExp(open?null:g.id)}>
                <div className="gf-top">
                  <div className="gf-ico" style={{background:g.bg}}>{g.icon}</div>
                  <div className="gf-info">
                    <div className="gf-name">{g.name}</div>
                    <div className="gf-meta">
                      <span>👤 {g.owner}</span>
                      {g.recorrente && <><div className="gf-dot"/><span>🔄</span></>}
                      {linkedGoal && <><div className="gf-dot"/><span style={{color:'var(--amber)'}}>🎯 {linkedGoal.name}</span></>}
                      <div className="gf-dot"/>
                      <span>Limite: {fmt(g.limit)}</span>
                    </div>
                  </div>
                  <div className="gf-right">
                    <div className="gf-spent" style={{color:pct>=100?'var(--coral)':pct>=80?'var(--amber)':'var(--text)'}}>{fmt(d.total)}</div>
                    <div className="gf-limit">{pct}% pago</div>
                    <div style={{fontSize:9,color:'var(--muted)',marginTop:1}}>{open?'▲':'▼'}</div>
                  </div>
                </div>

                <div className="gf-bar"><div className="gf-fill" style={{width:Math.min(pct,100)+'%',background:fc}}/></div>
                <div className="gf-foot">
                  <div className="gf-pct">{pct}% do limite</div>
                  <div className="gf-rest" style={{color:resto<0?'var(--coral)':resto<g.limit*.2?'var(--amber)':'var(--green)'}}>
                    {resto>=0 ? `${fmt(resto)} restante` : `${fmt(Math.abs(resto))} acima`}
                  </div>
                </div>

                {pct>=80&&pct<100 && <div className="gf-tag gf-tag-warn">⚠ {pct}% do limite usado</div>}
                {pct>=100 && <div className="gf-tag gf-tag-over">🚨 Limite ultrapassado!</div>}
                {d.total===0 && <div className="gf-tag" style={{color:'var(--blue)',background:'var(--blue-d)'}}>⏳ Ainda não pago</div>}

                {linkedGoal?.isParcela && (
                  <div className="gf-tag" style={{color:'var(--amber)',background:'var(--amber-d)'}}>
                    🏦 Parcela {linkedGoal.parcelasPagas}/{linkedGoal.parcelasTotal} paga
                  </div>
                )}

                {(d.gabriel>0||d.gabi>0) && (
                  <div className="gf-persons">
                    <div className="gf-person">
                      <div className="gf-person-av av-g">G</div>
                      <div className="gf-person-name">Gabriel</div>
                      <div className="gf-person-val" style={{color:'var(--amber)'}}>{fmt(d.gabriel)}</div>
                    </div>
                    <div className="gf-person">
                      <div className="gf-person-av av-a">G</div>
                      <div className="gf-person-name">Gabi</div>
                      <div className="gf-person-val" style={{color:'var(--coral)'}}>{fmt(d.gabi)}</div>
                    </div>
                  </div>
                )}
              </div>

              {open && (
                <div className="gf-expand">
                  <div className="gf-acts">
                    <button className="gf-act" onClick={() => onOpenTxForGf(g)}>
                      <span style={{fontSize:16}}>⬇️</span>Lançar
                    </button>
                    <button className="gf-act" onClick={() => setEditGf(g)}>
                      <span style={{fontSize:16}}>✏️</span>Editar
                    </button>
                    <button className="gf-act danger" onClick={() => setDelGf(g)}>
                      <span style={{fontSize:16}}>🗑️</span>Excluir
                    </button>
                  </div>
                  <div className="gf-txs-title">📋 Lançamentos vinculados</div>
                  {d.txs.length === 0
                    ? <div className="gf-no-tx">Nenhum lançamento vinculado.<br/>Toque em "Lançar" para registrar.</div>
                    : d.txs.map(t => (
                      <div key={t.id} className="gf-tx">
                        <div className="gf-tx-ic">{t.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="gf-tx-n">{t.name}</div>
                          <div className="gf-tx-sub">{t.date} · {t.owner}</div>
                        </div>
                        <div className="gf-tx-a">{fmt(Math.abs(t.amount))}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )
        })}
        <button className="add-gf" onClick={() => setNewGf(true)}>
          <span style={{fontSize:18}}>＋</span> Novo Gasto Fixo
        </button>
      </div>

      {(newGf || editGf) && (
        <GFModal gf={editGf} goals={goals}
          onClose={() => { setNewGf(false); setEditGf(null) }}
          onSave={saveGf}/>
      )}
      {delGf && (
        <Confirm title="Excluir gasto fixo?"
          msg={`Excluir "${delGf.name}"? Os lançamentos vinculados perderão a referência.`}
          onYes={() => { dispatch({type:'SET_GFS', gfs:gfs.filter(g=>g.id!==delGf.id)}); setDelGf(null); setExp(null) }}
          onNo={() => setDelGf(null)}/>
      )}
    </div>
  )
}
