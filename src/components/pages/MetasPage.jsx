import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import GoalModal from '../modals/GoalModal.jsx'
import ContribModal from '../modals/ContribModal.jsx'
import Confirm from '../modals/Confirm.jsx'
import { fmt, hoje, nextId } from '../../utils.js'

export default function MetasPage() {
  const { goals, txs, saldo, gfs, dispatch } = useFinance()
  const [exp,      setExp]      = useState(null)
  const [showNew,  setShowNew]  = useState(false)
  const [editG,    setEditG]    = useState(null)
  const [ctGoal,   setCtGoal]   = useState(null)
  const [delGoal,  setDelGoal]  = useState(null)
  const [confetti, setConf]     = useState(null)

  function saveGoal(g) {
    // recalculate target if parcela
    const goal = g.isParcela
      ? { ...g, target: g.parcelaValor * g.parcelasTotal, monthly: g.parcelaValor }
      : g
    dispatch({ type:'SET_GOALS', goals: editG ? goals.map(x => x.id===goal.id?goal:x) : [...goals, goal] })
    setShowNew(false); setEditG(null)
  }

  function addContrib(goalId, contrib) {
    const tx = {
      id:     Date.now(),
      name:   contrib.label,
      cat:    'Investimento',
      icon:   goals.find(g=>g.id===goalId)?.emoji || '🎯',
      amount: -contrib.amount,
      owner:  contrib.owner,
      date:   hoje(),
      type:   'out',
      gfId:   null,
    }
    dispatch({ type:'ADD_CONTRIB', goalId, contrib, tx })
    setCtGoal(null)
    setTimeout(() => { setConf('Aporte registrado! 💰'); setTimeout(() => setConf(null), 2400) }, 80)
  }

  function delContrib(goalId, ctId) {
    dispatch({ type:'DEL_CONTRIB', goalId, ctId })
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="D" style={{fontSize:23,fontWeight:700,letterSpacing:-1}}>Projetos & Metas</div>
      </div>

      <div className="goals-list">
        {goals.map(g => {
          const pct  = Math.min(100, Math.round((g.current/g.target)*100))
          const open = exp===g.id
          const linkedGf = gfs.find(gf => gf.goalId===g.id)

          return (
            <div key={g.id} className={`goal ${open?'exp':''}`}>
              <div className="g-top" onClick={() => setExp(open?null:g.id)}>
                <div className="g-left">
                  <div className="g-emo">{g.emoji}</div>
                  <div>
                    <div className="g-name">{g.name}</div>
                    {g.isParcela ? (
                      <div className="g-dl">
                        🏦 Parcela <strong style={{color:'var(--amber)'}}>{g.parcelasPagas}/{g.parcelasTotal}</strong>
                        {linkedGf && <span style={{marginLeft:5,color:'var(--muted)'}}>· vinculado a {linkedGf.icon}</span>}
                      </div>
                    ) : (
                      <div className="g-dl">📅 {g.deadline||'—'}</div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                  <div className="g-pct">{pct}%</div>
                  <div style={{fontSize:9,color:'var(--muted)',fontWeight:600}}>{open?'▲':'▼'}</div>
                </div>
              </div>

              <div className="g-bar"><div className="g-fill" style={{width:pct+'%'}}/></div>

              <div className="g-foot">
                <div className="g-amts"><span>{fmt(g.current)}</span> de {fmt(g.target)}</div>
                {g.isParcela ? (
                  <div className="g-mo">
                    <strong style={{color:'var(--amber)'}}>{fmt(g.parcelaValor)}/mês</strong>
                    {g.parcelasPagas < g.parcelasTotal && (
                      <span> · {g.parcelasTotal - g.parcelasPagas} restantes</span>
                    )}
                    {g.parcelasPagas >= g.parcelasTotal && (
                      <span style={{color:'var(--green)'}}> · ✅ Quitado!</span>
                    )}
                  </div>
                ) : (
                  <div className="g-mo">
                    <strong>+{fmt(g.monthly)}/mês</strong>
                    {g.monthly>0&&g.current<g.target&&<span> · {Math.ceil((g.target-g.current)/g.monthly)}m</span>}
                  </div>
                )}
              </div>

              {/* Parcela progress info */}
              {g.isParcela && (
                <div style={{margin:'8px 0 4px',padding:'8px 12px',background:'var(--s3)',borderRadius:11,display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em'}}>Comprometido nos próximos meses</div>
                    <div style={{fontFamily:'Fraunces,serif',fontSize:15,fontWeight:700,color:'var(--coral)',marginTop:2}}>
                      {fmt((g.parcelasTotal - g.parcelasPagas) * g.parcelaValor)}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:9,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em'}}>Já pago</div>
                    <div style={{fontFamily:'Fraunces,serif',fontSize:15,fontWeight:700,color:'var(--green)',marginTop:2}}>{fmt(g.current)}</div>
                  </div>
                </div>
              )}

              {open && (
                <div className="g-expand">
                  <div className="g-btns">
                    {!g.isParcela && (
                      <button className="g-btn pri" onClick={() => setCtGoal(g)}>
                        <span style={{fontSize:16}}>💰</span> Aportar
                      </button>
                    )}
                    <button className="g-btn" onClick={() => setEditG(g)}>
                      <span style={{fontSize:16}}>✏️</span> Editar
                    </button>
                    <button className="g-btn danger" onClick={() => setDelGoal(g)}>
                      <span style={{fontSize:16}}>🗑️</span> Excluir
                    </button>
                  </div>

                  {g.isParcela && (
                    <div style={{background:'var(--blue-d)',border:'1px solid rgba(96,165,250,.3)',borderRadius:11,padding:'9px 12px',marginBottom:11,fontSize:11,color:'var(--blue)',fontWeight:600}}>
                      🔗 Parcelas são registradas automaticamente ao lançar pagamentos no Gasto Fixo vinculado.
                    </div>
                  )}

                  <div className="ct-title">📋 Histórico</div>
                  <div className="ct-list">
                    {!(g.contribs?.length) && <div className="no-ct">Nenhum registro ainda.</div>}
                    {(g.contribs||[]).map(c => (
                      <div key={c.id} className="ct-row">
                        <div className="ct-dot"/>
                        <div className="ct-info">
                          <div className="ct-n">{c.label}</div>
                          <div className="ct-d">{c.date} · {c.owner}</div>
                        </div>
                        <div className="ct-a">+{fmt(c.amount)}</div>
                        <button className="ct-del" onClick={() => delContrib(g.id, c.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <button className="add-g" onClick={() => setShowNew(true)}>
          <span style={{fontSize:18}}>＋</span> Nova Meta
        </button>
      </div>

      {(showNew||editG) && <GoalModal goal={editG} onClose={() => { setShowNew(false); setEditG(null) }} onSave={saveGoal}/>}
      {ctGoal && <ContribModal goal={ctGoal} saldo={saldo} onClose={() => setCtGoal(null)} onSave={ct => addContrib(ctGoal.id, ct)}/>}
      {delGoal && (
        <Confirm title="Excluir meta?"
          msg={`Excluir "${delGoal.name}"? Todo o histórico será perdido.`}
          onYes={() => { dispatch({type:'SET_GOALS', goals:goals.filter(g=>g.id!==delGoal.id)}); setDelGoal(null); setExp(null) }}
          onNo={() => setDelGoal(null)}/>
      )}
      {confetti && <div className="conf"><div className="conf-i">🎉</div><div className="conf-m">{confetti}</div></div>}
    </div>
  )
}
