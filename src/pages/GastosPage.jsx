import { useState, useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import TxRow from '../components/TxRow'
import Confirm from '../components/modals/Confirm'
import { fmt } from '../utils/format'

const FILTERS = ['Todos', 'Entradas', 'Saídas', 'Gabriel', 'Gabi']

// ─── GastosPage ──────────────────────────────────────────────
export default function GastosPage({ onAdd, onEdit }) {
  const { txs, gfs, deleteTx } = useFinance()
  const [filter, setFilter] = useState('Todos')
  const [delId,  setDelId]  = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'Todos')    return txs
    if (filter === 'Entradas') return txs.filter(t => t.type === 'in')
    if (filter === 'Saídas')   return txs.filter(t => t.type === 'out')
    return txs.filter(t => t.owner === filter)
  }, [txs, filter])

  const totEnt = useMemo(() => filtered.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0), [filtered])
  const totSai = useMemo(() => Math.abs(filtered.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0)), [filtered])

  return (
    <div className="page">
      <div className="ph">
        <div className="D" style={{ fontSize: 23, fontWeight: 700, letterSpacing: -1, marginBottom: 10 }}>Lançamentos</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 11 }}>
          <div style={{ flex: 1, background: 'var(--green-d)', border: '1px solid var(--green)', borderRadius: 12, padding: '8px 12px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--green)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 2 }}>Entradas</div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 18, fontWeight: 700, color: 'var(--green)', letterSpacing: -0.5 }}>{fmt(totEnt)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--coral-d)', border: '1px solid var(--coral)', borderRadius: 12, padding: '8px 12px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--coral)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 2 }}>Saídas</div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 18, fontWeight: 700, color: 'var(--coral)', letterSpacing: -0.5 }}>{fmt(totSai)}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: `1px solid ${filter === f ? 'var(--amber)' : 'var(--border)'}`,
                background: filter === f ? 'var(--amber-d)' : 'var(--s2)',
                color: filter === f ? 'var(--amber)' : 'var(--muted)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe hint (first visit) */}
      <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 600 }}>← Deslize para excluir · → para editar</span>
      </div>

      <div className="tx-list">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            Nenhum lançamento aqui ainda.
          </div>
        ) : (
          filtered.map(tx => (
            <TxRow
              key={tx.id}
              tx={tx}
              gfs={gfs}
              onDelete={id => setDelId(id)}
              onEdit={onEdit}
            />
          ))
        )}
      </div>

      <div style={{ height: 20 }} />

      {delId && (
        <Confirm
          title="Excluir lançamento?"
          msg="Esse lançamento será removido permanentemente."
          onYes={() => { deleteTx(delId); setDelId(null) }}
          onNo={() => setDelId(null)}
        />
      )}
    </div>
  )
}
