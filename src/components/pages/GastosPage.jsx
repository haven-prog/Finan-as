import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import TxRow   from '../ui/TxRow.jsx'
import Confirm from '../modals/Confirm.jsx'
import { fmt } from '../../utils.js'
import { MES_ATUAL } from '../../constants.js'

export default function GastosPage({ onOpenTx }) {
  const { txs, gfs, totals, dispatch } = useFinance()
  const [filter, setFilter] = useState('all')
  const [toDelete, setToDel] = useState(null)

  const FILTERS = [
    { id:'all', lbl:'Todos' },
    { id:'in',  lbl:'Entradas' },
    { id:'out', lbl:'Saídas' },
    { id:'Gabriel', lbl:'Gabriel' },
    { id:'Gabi',    lbl:'Gabi' },
  ]

  const shown = [...txs]
    .reverse()
    .filter(t =>
      filter === 'all' ? true :
      filter === 'in'  ? t.amount > 0 :
      filter === 'out' ? t.amount < 0 :
      t.owner === filter
    )

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-title">Lançamentos</div>
        <div className="ph-sub">{MES_ATUAL}</div>
      </div>

      {/* Totais */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 20px 16px' }}>
        <div className="card">
          <div className="lbl">ENTRADAS</div>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:22, color:'var(--grn)', letterSpacing:'-.5px', marginTop:4 }}>{fmt(totals.ent)}</div>
        </div>
        <div className="card">
          <div className="lbl">SAÍDAS</div>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:22, color:'var(--red)', letterSpacing:'-.5px', marginTop:4 }}>{fmt(totals.sai)}</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding:'0 20px 12px' }}>
        <div className="filter-row">
          {FILTERS.map(f => (
            <button key={f.id} className={`fchip ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="swipe-hint">← deslize para excluir · → para editar</div>

      {/* Lista */}
      <div style={{ padding:'0 20px 20px' }}>
        {shown.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'32px' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:14, color:'var(--sub)' }}>Nenhum lançamento encontrado</div>
          </div>
        ) : (
          <div className="tx-list">
            {shown.map(tx => (
              <TxRow key={tx.id} tx={tx} gfs={gfs}
                onDelete={id => setToDel(id)}
                onEdit={tx => onOpenTx(tx.type, tx)}/>
            ))}
          </div>
        )}
      </div>

      {toDelete && (
        <Confirm title="Excluir lançamento?" msg="Esta ação não pode ser desfeita."
          onYes={() => { dispatch({ type:'DEL_TX', id:toDelete }); setToDel(null) }}
          onNo={() => setToDel(null)}/>
      )}
    </div>
  )
}
