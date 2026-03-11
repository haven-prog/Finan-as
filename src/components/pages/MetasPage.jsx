import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import GoalModal   from '../modals/GoalModal.jsx'
import ContribModal from '../modals/ContribModal.jsx'
import Confirm      from '../modals/Confirm.jsx'
import { fmt, nextId, hoje } from '../../utils.js'

export default function MetasPage() {
  const { goals, saldo, dispatch } = useFinance()
  const [expanded, setExpanded] = useState(null)
  const [modal,    setModal]    = useState(null)

  const totalSaved  = goals.reduce((a, g) => a + g.current, 0)
  const totalTarget = goals.reduce((a, g) => a + g.target, 0)

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div>
            <div className="ph-title">Metas</div>
            <div className="ph-sub">{fmt(totalSaved)} de {fmt(totalTarget)}</div>
          </div>
          <button className="sh-a" style={{ padding:'7px 14px', background:'var(--gold-a)', border:'1px solid rgba(240,165,0,.18)', borderRadius:99, fontSize:13 }}
            onClick={() => setModal({ kind:'new' })}>
            ＋ Nova Meta
          </button>
        </div>
      </div>

      <div className="goals-list">
        {goals.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'32px 20px' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <div style={{ fontFamily:'Instrument Serif,serif', fontSize:18, color:'var(--txt)', marginBottom:6 }}>Nenhuma meta ainda</div>
            <div style={{ fontSize:13, color:'var(--sub)', marginBottom:18 }}>Crie sua primeira meta e comece a poupar com foco.</div>
            <button className="btn-p" onClick={() => setModal({ kind:'new' })}>Criar primeira meta</button>
          </div>
        )}

        {goals.map(g => {
          const pct  = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0
          const done = pct >= 100
          const faltam = Math.max(0, g.target - g.current)
          const meses  = g.monthly > 0 ? Math.ceil(faltam / g.monthly) : null
          const isOpen = expanded === g.id

          return (
            <div key={g.id} className={`goal ${pct >= 80 && !done ? 'exp' : ''}`}>
              {/* Cabeçalho */}
              <div className="g-top" onClick={() => setExpanded(isOpen ? null : g.id)}>
                <div className="g-left">
                  <div className="g-emo">{g.emoji}</div>
                  <div>
                    <div className="g-name">{g.name}</div>
                    {g.isParcela
                      ? <div className="g-dl">Parcela {g.parcelasPagas}/{g.parcelasTotal} · {g.deadline || ''}</div>
                      : <div className="g-dl">{g.deadline || 'Sem prazo'}</div>
                    }
                  </div>
                </div>
                <div className={`g-pct ${done ? 'c-grn' : ''}`}>{done ? '✓' : pct + '%'}</div>
              </div>

              {/* Barra */}
              <div className="g-bar">
                <div className="g-fill" style={{ width: pct + '%', background: done ? 'var(--grn)' : undefined }}/>
              </div>

              {/* Rodapé */}
              <div className="g-foot">
                <div className="g-amts">
                  <strong>{fmt(g.current)}</strong> de {fmt(g.target)}
                </div>
                {meses && !done && (
                  <div className="g-mo">
                    <strong>{meses} {meses === 1 ? 'mês' : 'meses'}</strong>
                    <span style={{ display:'block', fontSize:10 }}> p/ concluir</span>
                  </div>
                )}
                {done && <div className="badge badge-grn">Concluída 🎉</div>}
              </div>

              {/* Expandido */}
              {isOpen && (
                <div className="g-expand">
                  <div className="g-btns">
                    <button className="g-btn pri" onClick={() => setModal({ kind:'contrib', goal:g })}>
                      <span>💰</span> Aportar
                    </button>
                    <button className="g-btn" onClick={() => setModal({ kind:'edit', goal:g })}>
                      <span>✏️</span> Editar
                    </button>
                    <button className="g-btn danger" onClick={() => setModal({ kind:'del', goal:g })}>
                      <span>🗑️</span> Excluir
                    </button>
                  </div>

                  {g.isParcela && (
                    <div className="parcela-strip">
                      <span style={{ fontSize:20 }}>🏦</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--txt)' }}>
                          {g.parcelasPagas} de {g.parcelasTotal} parcelas pagas
                        </div>
                        <div style={{ fontSize:11, color:'var(--sub)', marginTop:2 }}>
                          {fmt(g.parcelaValor)}/mês · {g.parcelasTotal - g.parcelasPagas} restantes
                        </div>
                      </div>
                    </div>
                  )}

                  {(g.contribs || []).length > 0 && (
                    <>
                      <div className="ct-title" style={{ marginTop:10 }}>Histórico de aportes</div>
                      {[...g.contribs].reverse().map(ct => (
                        <div key={ct.id} className="ct-row">
                          <div className="ct-dot"/>
                          <div className="ct-info">
                            <div className="ct-name">{ct.label}</div>
                            <div className="ct-date">{ct.owner} · {ct.date}</div>
                          </div>
                          <div className="ct-amt">+{fmt(ct.amount)}</div>
                          <button className="ct-del" onClick={() => dispatch({ type:'DEL_CONTRIB', goalId:g.id, contribId:ct.id })}>×</button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {goals.length > 0 && (
          <button className="add-btn" onClick={() => setModal({ kind:'new' })}>
            <span>＋</span> Nova Meta
          </button>
        )}
      </div>

      {/* Modais */}
      {modal?.kind === 'new' && (
        <GoalModal onClose={() => setModal(null)}
          onSave={g => { dispatch({ type:'ADD_GOAL', goal:g }); setModal(null) }}/>
      )}
      {modal?.kind === 'edit' && (
        <GoalModal goal={modal.goal} onClose={() => setModal(null)}
          onSave={g => { dispatch({ type:'EDIT_GOAL', goal:g }); setModal(null) }}/>
      )}
      {modal?.kind === 'del' && (
        <Confirm title="Excluir meta?" msg={`Remover "${modal.goal.name}"?`}
          onYes={() => { dispatch({ type:'DEL_GOAL', id:modal.goal.id }); setModal(null) }}
          onNo={() => setModal(null)}/>
      )}
      {modal?.kind === 'contrib' && (
        <ContribModal goal={modal.goal} saldo={saldo} onClose={() => setModal(null)}
          onSave={contrib => {
            const c = { ...contrib, id: nextId(modal.goal.contribs || []) }
            dispatch({ type:'ADD_CONTRIB', goalId:modal.goal.id, contrib:c })
            dispatch({
              type:'ADD_TX',
              tx: { id:Date.now(), name:`Aporte: ${modal.goal.name}`, cat:'Investimento',
                icon:modal.goal.emoji, amount:-contrib.amount, owner:contrib.owner,
                date:hoje(), type:'out', gfId:null }
            })
            setModal(null)
          }}/>
      )}
    </div>
  )
}
