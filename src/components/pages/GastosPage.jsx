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
    if (filter==='Todos')    return txs
    if (filter==='Entradas') return txs.filter(t => t.type==='in')
    if (filter==='Saídas')   return txs.filter(t => t.type==='out')
    return txs.filter(t => t.owner===filter)
  }, [txs, filter])

  const totEnt = filtered.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount, 0)
  const totSai = Math.abs(filtered.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount, 0))

  function deleteTx(id) { dispatch({ type:'DELETE_TX', id }) }

  return (
    <div className="page">
      <div className="ph">
        <div className="D" style={{fontSize:23,fontWeight:700,letterSpacing:-1,marginBottom:10}}>Gastos</div>
        <div style={{display:'flex',gap:8,marginBottom:11}}>
          <div style={{flex:1,background:'var(--green-d)',border:'1px solid var(--green)',borderRadius:12,padding:'8px 12px'}}>
            <div style={{fontSize:9.5,fontWeight:700,color:'var(--green)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:2}}>Entradas</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:700,color:'var(--green)'}}>{fmt(totEnt)}</div>
          </div>
          <div style={{flex:1,background:'var(--coral-d)',border:'1px solid var(--coral)',borderRadius:12,padding:'8px 12px'}}>
            <div style={{fontSize:9.5,fontWeight:700,color:'var(--coral)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:2}}>Saídas</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:700,color:'var(--coral)'}}>{fmt(totSai)}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{padding:'5px 11px',borderRadius:20,border:`1px solid ${filter===f?'var(--amber)':'var(--border)'}`,
                background:filter===f?'var(--amber-d)':'var(--s2)',color:filter===f?'var(--amber)':'var(--muted)',
                fontSize:11,fontWeight:700,cursor:'pointer'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'0 20px'}}>
        <div style={{fontSize:11,color:'var(--muted)',marginBottom:10,textAlign:'center'}}>
          ← Deslize para editar · → Deslize para excluir · Duplo toque para editar
        </div>
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'var(--muted)',fontSize:13}}>
            Nenhum lançamento encontrado.
          </div>
        )}
        {filtered.map(tx => (
          <TxRow key={tx.id} tx={tx} gfs={gfs}
            onDelete={id => setDelId(id)}
            onEdit={tx => onOpenTx(tx.type, tx)}/>
        ))}
      </div>

      {delId && (
        <Confirm title="Excluir lançamento?"
          msg="Esta ação não pode ser desfeita."
          onYes={() => { deleteTx(delId); setDelId(null) }}
          onNo={() => setDelId(null)}/>
      )}
    </div>
  )
}
