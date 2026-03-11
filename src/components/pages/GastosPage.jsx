import { useState, useMemo } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import TxRow from '../ui/TxRow.jsx'
import Confirm from '../modals/Confirm.jsx'
import { fmt } from '../../utils.js'

const FILTERS = ['Todos','Entradas','Saídas','Gabriel','Gabi']

export default function GastosPage({ onOpenTx }) {
  const { txs, gfs, dispatch } = useFinance()
  const [filter, setFilter] = useState('Todos')
  const [delId,  setDelId]  = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'Todos')    return txs
    if (filter === 'Entradas') return txs.filter(t => t.type === 'in')
    if (filter === 'Saídas')   return txs.filter(t => t.type === 'out')
    return txs.filter(t => t.owner === filter)
  }, [txs, filter])

  const totEnt = filtered.filter(t => t.type==='in').reduce((s,t) => s+t.amount, 0)
  const totSai = Math.abs(filtered.filter(t => t.type==='out').reduce((s,t) => s+t.amount, 0))

  return (
    <div className="page">
      {/* Header */}
      <div className="ph">
        <div style={{ fontFamily:'Instrument Serif,serif', fontSize:28, letterSpacing:'-.5px', marginBottom:18 }}>
          Lançamentos
        </div>

        {/* Totais */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <div style={{
            background:'var(--s1)', border:'1px solid rgba(72,201,122,.15)',
            borderRadius:16, padding:'14px 16px',
          }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--sub)', marginBottom:6 }}>Entradas</div>
            <div style={{ fontFamily:'Instrument Serif,serif', fontSize:22, color:'var(--green)' }}>
              {fmt(totEnt)}
            </div>
          </div>
          <div style={{
            background:'var(--s1)', border:'1px solid rgba(240,96,96,.15)',
            borderRadius:16, padding:'14px 16px',
          }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--sub)', marginBottom:6 }}>Saídas</div>
            <div style={{ fontFamily:'Instrument Serif,serif', fontSize:22, color:'var(--coral)' }}>
              {fmt(totSai)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:6, overflowX:'auto' }}>
          {FILTERS.map(f => (
            <button key={f} className={`chip${filter===f?' active':''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding:'0 22px' }}>
        <div className="swipe-hint">← excluir · → editar</div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--sub)', fontSize:14 }}>
            Nenhum lançamento aqui.
          </div>
        ) : (
          <div className="tx-list">
            {filtered.map(tx => (
              <TxRow key={tx.id} tx={tx} gfs={gfs}
                onDelete={id => setDelId(id)}
                onEdit={tx => onOpenTx(tx.type, tx)}/>
            ))}
          </div>
        )}

        <button className="add-tx-btn" onClick={() => onOpenTx('out')}>
          + Novo lançamento
        </button>
      </div>

      {delId && (
        <Confirm
          title="Excluir lançamento?"
          msg="Esta ação não pode ser desfeita."
          onYes={() => { dispatch({ type:'DELETE_TX', id:delId }); setDelId(null) }}
          onNo={() => setDelId(null)}
        />
      )}
    </div>
  )
}
