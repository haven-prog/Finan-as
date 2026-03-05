import { useRef, useCallback } from 'react'
import { fmt } from '../../utils.js'

const SWIPE_THRESHOLD = 65

export default function TxRow({ tx, gfs, onDelete, onEdit }) {
  const startX    = useRef(0)
  const curOffset = useRef(0)
  const rowRef    = useRef(null)
  const bgLRef    = useRef(null)
  const bgRRef    = useRef(null)
  const isSwiping = useRef(false)

  const linkedGf    = gfs?.find(g => g.id === tx.gfId)
  const isInvest    = tx.cat === 'Investimento'
  const isReconcile = tx.isReconcile

  const setTranslate = (dx) => {
    if (!rowRef.current) return
    rowRef.current.style.transform = `translateX(${dx}px)`
    // Show/hide background hints
    if (bgLRef.current) {
      bgLRef.current.style.width = `${Math.abs(Math.min(dx, 0))}px`
      bgLRef.current.style.opacity = dx < -8 ? '1' : '0'
    }
    if (bgRRef.current) {
      bgRRef.current.style.width = `${Math.max(dx, 0)}px`
      bgRRef.current.style.opacity = dx > 8 ? '1' : '0'
    }
  }

  const snap = (to) => {
    if (!rowRef.current) return
    rowRef.current.style.transition = 'transform .28s cubic-bezier(.16,1,.3,1)'
    setTranslate(to)
    if (bgLRef.current) bgLRef.current.style.transition = 'all .28s'
    if (bgRRef.current) bgRRef.current.style.transition = 'all .28s'
    setTimeout(() => {
      if (rowRef.current) rowRef.current.style.transition = 'none'
    }, 300)
  }

  const onTouchStart = useCallback((e) => {
    startX.current  = e.touches[0].clientX
    curOffset.current = 0
    isSwiping.current = true
    if (rowRef.current) rowRef.current.style.transition = 'none'
    if (bgLRef.current) bgLRef.current.style.transition = 'none'
    if (bgRRef.current) bgRRef.current.style.transition = 'none'
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!isSwiping.current) return
    const dx = e.touches[0].clientX - startX.current
    const clamped = Math.max(-120, Math.min(90, dx))
    curOffset.current = clamped
    setTranslate(clamped)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!isSwiping.current) return
    isSwiping.current = false
    const off = curOffset.current
    curOffset.current = 0
    if (off < -SWIPE_THRESHOLD) {
      snap(-120)
      setTimeout(() => { snap(0); setTimeout(() => onDelete(tx.id), 280) }, 120)
    } else if (off > SWIPE_THRESHOLD) {
      snap(0)
      onEdit(tx)
    } else {
      snap(0)
    }
  }, [tx, onDelete, onEdit])

  return (
    <div className="tx-wrap" style={{ position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
      {/* Delete bg (swipe left) */}
      <div ref={bgLRef} style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 0, opacity: 0,
        background: 'rgba(255,107,107,.2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, borderRadius: '0 14px 14px 0',
        pointerEvents: 'none',
      }}>🗑️</div>
      {/* Edit bg (swipe right) */}
      <div ref={bgRRef} style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 0, opacity: 0,
        background: 'rgba(96,165,250,.2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, borderRadius: '14px 0 0 14px',
        pointerEvents: 'none',
      }}>✏️</div>

      <div
        ref={rowRef}
        className="tx-row"
        style={{ willChange: 'transform' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={() => onEdit(tx)}
      >
        <div className="tx-ic">{tx.icon}</div>
        <div className="tx-info">
          <div className="tx-n">
            {tx.name}
            {isInvest    && <span className="tx-badge tx-badge-inv">META</span>}
            {isReconcile && <span className="tx-badge" style={{ background:'var(--blue-d)',color:'var(--blue)' }}>⚖️ AJUSTE</span>}
            {linkedGf    && <span className="gf-pill">{linkedGf.icon} {linkedGf.name}</span>}
          </div>
          <div className="tx-m">
            <span>{tx.cat}</span><div className="tdot"/>
            <span>{tx.owner}</span><div className="tdot"/>
            <span>{tx.date}</span>
          </div>
        </div>
        <div className={`tx-a ${tx.amount < 0 ? 'tn' : 'tp'}`}>
          {tx.amount < 0 ? '−' : '+'}{fmt(Math.abs(tx.amount))}
        </div>
      </div>
    </div>
  )
}
