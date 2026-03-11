import { useRef, useCallback } from 'react'
import { fmt } from '../../utils.js'
const THRESH = 65
export default function TxRow({ tx, gfs, onDelete, onEdit }) {
  const startX = useRef(0), curOff = useRef(0), swiping = useRef(false)
  const rowRef = useRef(null), bgL = useRef(null), bgR = useRef(null)
  const linkedGf = gfs?.find(g => g.id === tx.gfId)
  const setT = dx => {
    if (!rowRef.current) return
    rowRef.current.style.transform = `translateX(${dx}px)`
    if (bgL.current) { bgL.current.style.width = `${Math.abs(Math.min(dx,0))}px`; bgL.current.style.opacity = dx < -8 ? '1' : '0' }
    if (bgR.current) { bgR.current.style.width = `${Math.max(dx,0)}px`;           bgR.current.style.opacity = dx > 8  ? '1' : '0' }
  }
  const snap = to => {
    if (!rowRef.current) return
    rowRef.current.style.transition = 'transform .26s cubic-bezier(.16,1,.3,1)'
    setT(to)
    setTimeout(() => { if (rowRef.current) rowRef.current.style.transition = 'none' }, 280)
  }
  const onTS = useCallback(e => {
    startX.current = e.touches[0].clientX; curOff.current = 0; swiping.current = true
    if (rowRef.current) rowRef.current.style.transition = 'none'
  }, [])
  const onTM = useCallback(e => {
    if (!swiping.current) return
    const dx = Math.max(-120, Math.min(90, e.touches[0].clientX - startX.current))
    curOff.current = dx; setT(dx)
  }, [])
  const onTE = useCallback(() => {
    if (!swiping.current) return; swiping.current = false
    const off = curOff.current; curOff.current = 0
    if (off < -THRESH) { snap(-120); setTimeout(() => { snap(0); setTimeout(() => onDelete(tx.id), 280) }, 120) }
    else if (off > THRESH) { snap(0); onEdit(tx) }
    else snap(0)
  }, [tx, onDelete, onEdit])
  return (
    <div className="tx-wrap">
      <div ref={bgL} style={{ position:'absolute',right:0,top:0,bottom:0,width:0,opacity:0,background:'rgba(245,96,96,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,borderRadius:'0 12px 12px 0',pointerEvents:'none' }}>🗑️</div>
      <div ref={bgR} style={{ position:'absolute',left:0,top:0,bottom:0,width:0,opacity:0,background:'rgba(91,154,244,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,borderRadius:'12px 0 0 12px',pointerEvents:'none' }}>✏️</div>
      <div ref={rowRef} className="tx-row" onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} onDoubleClick={() => onEdit(tx)}>
        <div className="tx-ic">{tx.icon}</div>
        <div className="tx-info">
          <div className="tx-name">
            {tx.name}
            {tx.cat === 'Investimento' && <span className="tx-badge tx-badge-meta">META</span>}
            {linkedGf && <span className="tx-badge tx-badge-gf">{linkedGf.icon} {linkedGf.name}</span>}
          </div>
          <div className="tx-meta">
            <span>{tx.cat}</span><div className="tdot"/><span>{tx.owner}</span><div className="tdot"/><span>{tx.date}</span>
          </div>
        </div>
        <div className={`tx-amt ${tx.amount < 0 ? 'amt-out' : 'amt-in'}`}>
          {tx.amount < 0 ? '−' : '+'}{fmt(Math.abs(tx.amount))}
        </div>
      </div>
    </div>
  )
}
