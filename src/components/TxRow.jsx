import { useState, useRef } from 'react'
import { fmt } from '../utils/format'

// ─── TxRow ────────────────────────────────────────────────────
// Swipe left  → reveal delete
// Swipe right → trigger edit
// Tap         → toggle details

const SWIPE_THRESHOLD = 60   // px to trigger action
const SWIPE_RESISTANCE = 0.4 // slowdown factor when overswipe

export default function TxRow({ tx, gfs = [], onDelete, onEdit }) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const dirLocked = useRef(null) // 'h' | 'v' | null

  const linkedGf    = gfs.find(g => g.id === tx.gfId)
  const isInvest    = tx.cat === 'Investimento'
  const isNegative  = tx.amount < 0

  // ── Touch handlers ───────────────────────────────────────
  const onTouchStart = (e) => {
    startX.current   = e.touches[0].clientX
    startY.current   = e.touches[0].clientY
    dirLocked.current = null
    setSwiping(true)
  }

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    // Lock direction on first significant move
    if (!dirLocked.current) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dirLocked.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      }
    }

    if (dirLocked.current === 'h') {
      e.preventDefault()
      // Left swipe: max -80px; Right swipe: allow up to 40px then resist
      if (dx < 0) {
        setOffsetX(Math.max(-90, dx))
      } else {
        setOffsetX(Math.min(40, dx * SWIPE_RESISTANCE))
      }
    }
  }

  const onTouchEnd = () => {
    setSwiping(false)
    if (dirLocked.current === 'h') {
      if (offsetX <= -SWIPE_THRESHOLD) {
        // Stay open (delete revealed)
        setOffsetX(-80)
      } else if (offsetX >= SWIPE_THRESHOLD * 0.5) {
        // Swipe right → edit
        setOffsetX(0)
        onEdit(tx)
      } else {
        setOffsetX(0)
      }
    }
    dirLocked.current = null
  }

  const handleRowTap = () => {
    if (offsetX !== 0) { setOffsetX(0); return }
  }

  const isOpen = offsetX <= -60

  return (
    <div className="tx-wrap">
      {/* Delete background */}
      <div className="tx-del-bg" onClick={() => { setOffsetX(0); onDelete(tx.id) }}>
        <div className="tx-del-ico">🗑️</div>
        <div className="tx-del-lbl">Excluir</div>
      </div>

      {/* Edit hint (right swipe) */}
      {offsetX > 10 && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 60,
          background: 'var(--blue-d)', border: '1px solid var(--blue)',
          borderRadius: '13px 0 0 13px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3, zIndex: 0,
        }}>
          <span style={{ fontSize: 18 }}>✏️</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--blue)' }}>Editar</span>
        </div>
      )}

      <div
        className="tx-row"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform .25s cubic-bezier(.16,1,.3,1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleRowTap}
        onDoubleClick={() => { setOffsetX(0); onEdit(tx) }}
      >
        <div className="tx-ic">{tx.icon}</div>
        <div className="tx-info">
          <div className="tx-n">
            {tx.name}
            {isInvest  && <span className="tx-badge tx-badge-inv">META</span>}
            {linkedGf  && <span className="gf-pill">{linkedGf.icon} {linkedGf.name}</span>}
          </div>
          <div className="tx-m">
            <span>{tx.cat}</span>
            <div className="tdot" />
            <span>{tx.owner}</span>
            <div className="tdot" />
            <span>{tx.date}</span>
          </div>
        </div>
        <div className={`tx-a ${isNegative ? 'tn' : 'tp'}`}>
          {isNegative ? '−' : '+'}{fmt(Math.abs(tx.amount))}
        </div>
      </div>
    </div>
  )
}
