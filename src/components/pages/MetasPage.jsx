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
    const goal = g.isParcela
      ? { ...g, target: g.parcelaValor * g.parcelasTotal, monthly: g.parcelaValor }
      : g
    dispatch({ type:'SET_GOALS', goals: editG ? goals.map(x => x.id===goal.id ? goal : x) : [...goals, goal] })
    setShowNew(false); setEditG(null)
  }

  function addContrib(goalId, contrib) {
    const tx = {
      id: Date.now(), name: contrib.label, cat: 'Investimento',
      icon: goals.find(g => g.id===goalId)?.emoji || '🎯',
      amount: -contrib.amount, owner: contrib.owner,
      date: hoje(), type: 'out', gfId: null,
    }
    dispatch({ type:'ADD_CONTRIB', goalId, contrib, tx })
    setCtGoal(null)
    setTimeout(() => { setConf('Aporte registrado! 💰'); setTimeout(() => setConf(null), 2400) }, 80)
  }

  const totalSaved  = goals.reduce((s,g) => s + g.current, 0)
  const totalTarget = goals.reduce((s,g) => s + g.target, 0)

  return (
    <div className="page">
      <div className="ph">
        <div style={{ fontFamily:'Instrument Serif,serif', fontSize:28, letterSpacing:'-.5px', marginBottom:4 }}>
          Metas
        </div>
        {goals.length > 0 && (
          <div style={{ fontSize:12, color:'var(--sub)', marginBottom:0 }}>
            {fmt(totalSaved)} guardados de {fmt(totalTarget)}
          </div>
        )}
      </div>

      <div className="goals-list">
        {goals.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--sub)', fontSize:14 }}>
            Nenhuma meta ainda.<br/>
            <span style={{ color:'var(--amber)' }}>Crie sua primeira meta abaixo.</span>
          </div>
        )}

        {goals.map(g => {
          const pct     = Math.min(100, Math.round((g.current / g.target) * 100))
          const open    = exp === g.id
          const linkedGf = gfs.find(gf => gf.goalId === g.id)
          const concluida = pct >= 100

          return (
            <div key={g.id} className={`goal${open ? ' exp' : ''}`}>

              {/* Topo clicável */}
              <div className="g-top" onClick={() => setExp(open ? null : g.id)}>
                <div className="g-left">
                  <div className="g-emo">{g.emoji}</div>
                  <div>
                    <div className="g-name">{g.name}</div>
                    <div className="g-dl">
                      {g.isParcela
                        ? <>🏦 Parcela <strong style={{ color:'var(--amber)' }}>{g.parcelasPagas}/{g.parcelasTotal}</strong>
                            {linkedGf && <span style={{ color:'var(--sub)', marginLeft:5 }}>· {linkedGf.icon}</span>}</>
                        : `📅 ${g.deadline || '—'}`
                      }
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="g-pct" style={{ color: concluida ? 'var(--green)' : 'var(--amber)' }}>
                    {concluida ? '✓' : `${pct}%`}
                  </div>
                </div>
              </div>

              {/* Barra */}
              <div className="g-bar">
                <div className="g-fill" style={{
                  width: pct + '%',
                  background: concluida ? 'var(--green)' : 'linear-gradient(90deg,var(--amber),#fbbf24)',
                }}/>
              </div>

              {/* Rodapé */}
              <div className="g-foot" style={{ marginTop:8 }}>
                <div className="g-amts">
                  <span style={{ fontFamily:'Instrument Serif,serif', fontSize:15 }}>{fmt(g.current)}</span>
                  <span style={{ color:'var(--sub)' }}> / {fmt(g.target)}</span>
                </div>
                {g.isParcela ? (
                  <div className="g-mo">
                    {g.parcelasPagas >= g.parcelasTotal
                      ? <strong style={{ color:'var(--green)' }}>✅ Quitado</strong>
                      : <><strong style={{ color:'var(--amber)', fontFamily:'Instrument Serif,serif', fontSize:14 }}>
                          {fmt(g.parcelaValor)}/mês
                        </strong>
                        <span style={{ color:'var(--sub)', fontSize:11 }}> · {g.parcelasTotal - g.parcelasPagas} restantes</span></>
                    }
                  </div>
                ) : (
                  <div className="g-mo">
                    {g.monthly > 0 && g.current < g.target && (
                      <><strong style={{ fontFamily:'Instrument Serif,serif', fontSize:14, color:'var(--green)' }}>
                        {fmt(g.monthly)}/mês
                      </strong>
                      <span style={{ color:'var(--sub)', fontSize:11 }}> · {Math.ceil((g.target-g.current)/g.monthly)}m</span></>
                    )}
                  </div>
                )}
              </div>

              {/* Painel expandido */}
              {open && (
                <div className="g-expand">
                  <div className="g-btns">
                    {!g.isParcela && (
                      <button className="g-btn pri" onClick={() => setCtGoal(g)}>
                        <span>💰</span> Aportar
                      </button>
                    )}
                    <button className="g-btn" onClick={() => setEditG(g)}>
                      <span>✏️</span> Editar
                    </button>
                    <button className="g-btn danger" onClick={() => setDelGoal(g)}>
                      <span>🗑️</span> Excluir
                    </button>
                  </div>

                  {g.isParcela && (
                    <div style={{
                      background:'var(--blue-d)', border:'1px solid rgba(91,156,246,.2)',
                      borderRadius:12, padding:'10px 13px', marginBottom:12,
                      fontSize:12, color:'var(--blue)', fontWeight:600,
                    }}>
                      🔗 Parcelas registradas automaticamente ao pagar o gasto fixo vinculado.
                    </div>
                  )}

                  {/* Histórico */}
                  {(g.contribs?.length > 0) && (
                    <>
                      <div className="ct-title">Histórico</div>
                      <div className="ct-list">
                        {g.contribs.map(c => (
                          <div key={c.id} className="ct-row">
                            <div className="ct-dot"/>
                            <div className="ct-info">
                              <div className="ct-n">{c.label}</div>
                              <div className="ct-d">{c.date} · {c.owner}</div>
                            </div>
                            <div className="ct-a">+{fmt(c.amount)}</div>
                            <button className="ct-del" onClick={() => dispatch({ type:'DEL_CONTRIB', goalId:g.id, ctId:c.id })}>×</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <button className="add-g" onClick={() => setShowNew(true)}>
          + Nova Meta
        </button>
      </div>

      {(showNew || editG) && (
        <GoalModal goal={editG} onClose={() => { setShowNew(false); setEditG(null) }} onSave={saveGoal}/>
      )}
      {ctGoal && (
        <ContribModal goal={ctGoal} saldo={saldo} onClose={() => setCtGoal(null)} onSave={ct => addContrib(ctGoal.id, ct)}/>
      )}
      {delGoal && (
        <Confirm
          title="Excluir meta?"
          msg={`Excluir "${delGoal.name}"? Todo o histórico será perdido.`}
          onYes={() => { dispatch({ type:'SET_GOALS', goals:goals.filter(g => g.id!==delGoal.id) }); setDelGoal(null); setExp(null) }}
          onNo={() => setDelGoal(null)}
        />
      )}
      {confetti && <div className="conf"><div className="conf-i">🎉</div><div className="conf-m">{confetti}</div></div>}
    </div>
  )
}
