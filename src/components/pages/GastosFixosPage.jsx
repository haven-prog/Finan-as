import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import GFModal   from '../modals/GFModal.jsx'
import Confirm   from '../modals/Confirm.jsx'
import TxModal   from '../modals/TxModal.jsx'
import { fmt }   from '../../utils.js'
import { MES_ATUAL } from '../../constants.js'

export default function GastosFixosPage({ onOpenTxForGf }) {
  const { txs, gfs, goals, dispatch } = useFinance()
  const [expanded, setExpanded] = useState(null)
  const [modal,    setModal]    = useState(null)

  const cards = gfs.map(gf => {
    const paid  = txs.filter(t => t.gfId === gf.id && t.amount < 0)
    const spent = paid.reduce((a, t) => a + Math.abs(t.amount), 0)
    const pct   = gf.limit > 0 ? Math.round(spent / gf.limit * 100) : 0
    const remaining = Math.max(0, gf.limit - spent)
    const status = pct >= 100 ? 'over' : pct >= 80 ? 'exp' : ''
    return { ...gf, spent, pct, remaining, status, paid }
  })

  const totalLimit = gfs.reduce((a, g) => a + g.limit, 0)
  const totalSpent = cards.reduce((a, g) => a + g.spent, 0)
  const totalPct   = totalLimit > 0 ? Math.round(totalSpent / totalLimit * 100) : 0

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-title">Gastos Fixos</div>
        <div className="ph-sub">{MES_ATUAL}</div>
      </div>

      {/* Resumo do mês */}
      <div style={{ margin:'0 20px 18px' }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div className="lbl">PAGO ESTE MÊS</div>
              <div style={{ fontFamily:'Instrument Serif,serif', fontSize:34, letterSpacing:'-1px', color:'var(--txt)', margin:'4px 0 2px' }}>{fmt(totalSpent)}</div>
              <div style={{ fontSize:12, color:'var(--sub)' }}>de {fmt(totalLimit)} planejado</div>
            </div>
            <span className={`badge ${totalPct >= 100 ? 'badge-red' : totalPct >= 80 ? 'badge-gold' : 'badge-grn'}`}>
              {totalPct}%
            </span>
          </div>
          <div className="bar-wrap" style={{ height:5 }}>
            <div className="bar-fill" style={{
              width: totalPct + '%',
              background: totalPct >= 100 ? 'var(--red)' : totalPct >= 80 ? 'var(--gold)' : 'var(--grn)'
            }}/>
          </div>
        </div>
      </div>

      {/* Lista de fixos */}
      <div className="gf-list">
        {cards.map(gf => (
          <div key={gf.id} className={`gf-card ${gf.status}`}>
            <div className="gf-head" onClick={() => setExpanded(expanded === gf.id ? null : gf.id)}>
              <div className="gf-top">
                <div className="gf-ico">{gf.icon}</div>
                <div className="gf-info">
                  <div className="gf-name">{gf.name}</div>
                  <div className="gf-meta">{gf.owner} · {gf.recorrente ? 'Recorrente' : 'Avulso'}</div>
                </div>
                <div className="gf-right">
                  <div className={`gf-spent ${gf.status === 'over' ? 'c-red' : gf.status === 'exp' ? 'c-gold' : 'c-grn'}`}>
                    {fmt(gf.spent)}
                  </div>
                  <div className="gf-of">de {fmt(gf.limit)}</div>
                </div>
              </div>
              <div className="bar-wrap">
                <div className="bar-fill" style={{
                  width: gf.pct + '%',
                  background: gf.pct >= 100 ? 'var(--red)' : gf.pct >= 80 ? 'var(--gold)' : 'var(--grn)'
                }}/>
              </div>
              <div className="gf-foot">
                <div className="gf-pct">{gf.pct}% utilizado</div>
                <div className={`gf-rest ${gf.remaining <= 0 ? 'c-red' : 'c-grn'}`}>
                  {gf.remaining <= 0 ? 'Limite atingido' : `${fmt(gf.remaining)} restante`}
                </div>
              </div>
            </div>

            {expanded === gf.id && (
              <div className="gf-expand">
                <div className="gf-acts">
                  <button className="gf-act pri" onClick={() => setModal({ kind:'tx', gf })}>
                    <span>💳</span> Registrar
                  </button>
                  <button className="gf-act" onClick={() => setModal({ kind:'edit', gf })}>
                    <span>✏️</span> Editar
                  </button>
                  <button className="gf-act danger" onClick={() => setModal({ kind:'del', gf })}>
                    <span>🗑️</span> Excluir
                  </button>
                </div>
                <div className="gf-txs-title">Lançamentos vinculados</div>
                {gf.paid.length === 0
                  ? <div className="gf-no-tx">Nenhum lançamento ainda</div>
                  : gf.paid.map(t => (
                    <div key={t.id} className="gf-tx">
                      <div className="gf-tx-ic">{t.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="gf-tx-n">{t.name}</div>
                        <div className="gf-tx-sub">{t.owner} · {t.date}</div>
                      </div>
                      <div className="gf-tx-amt">−{fmt(Math.abs(t.amount))}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        ))}

        <button className="add-btn" onClick={() => setModal({ kind:'new' })}>
          <span>＋</span> Novo Gasto Fixo
        </button>
      </div>

      {/* Modais */}
      {modal?.kind === 'new' && (
        <GFModal goals={goals} onClose={() => setModal(null)}
          onSave={gf => { dispatch({ type:'ADD_GF', gf }); setModal(null) }}/>
      )}
      {modal?.kind === 'edit' && (
        <GFModal gf={modal.gf} goals={goals} onClose={() => setModal(null)}
          onSave={gf => { dispatch({ type:'EDIT_GF', gf }); setModal(null) }}/>
      )}
      {modal?.kind === 'del' && (
        <Confirm title="Excluir fixo?" msg={`Remover "${modal.gf.name}"?`}
          onYes={() => { dispatch({ type:'DEL_GF', id:modal.gf.id }); setModal(null) }}
          onNo={() => setModal(null)}/>
      )}
      {modal?.kind === 'tx' && (
        <TxModal gfs={gfs} defaultType="out" preGfId={modal.gf.id}
          onClose={() => setModal(null)}
          onSave={tx => { dispatch({ type:'ADD_TX', tx }); setModal(null) }}/>
      )}
    </div>
  )
}
