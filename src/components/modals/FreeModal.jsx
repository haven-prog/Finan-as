import { useState } from 'react'
import { fmt } from '../../utils.js'

import { useFinance } from '../../context/FinanceContext.jsx'
export default function FreeModal({ onClose, onSave }) {
  const { free } = useFinance()
  const [limit, setLimit] = useState(String(free.limit || 1000))
  const bump = d => setLimit(v => String(Math.max(0,(parseInt(v)||0)+d)))

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">Gasto Livre do Casal</div>
        <div className="sh-s">Limite mensal combinado para lazer e gastos pessoais.</div>

        <div style={{background:'linear-gradient(135deg,var(--amber-d),rgba(245,166,35,.05))',border:'1px solid var(--amber)',borderRadius:16,padding:'16px',marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>👫 Limite do Casal</div>
          <div style={{fontFamily:'Fraunces,serif',fontSize:34,fontWeight:700,letterSpacing:-1,color:'var(--text)'}}>{fmt(parseInt(limit)||0)}</div>
          <div style={{fontSize:10,color:'var(--muted)',marginTop:4}}>dividido entre os dois</div>
        </div>

        <label className="fl-lbl">Limite mensal combinado (R$)</label>
        <div className="step-row">
          <button className="step-btn" onClick={() => bump(-100)}>−</button>
          <div className="amtw step-inp" style={{margin:0,padding:'10px 14px'}}>
            <div className="cur" style={{fontSize:16}}>R$</div>
            <input className="ain" style={{fontSize:22}} placeholder="1000" type="number" inputMode="numeric"
              value={limit} onChange={e => setLimit(e.target.value)}/>
          </div>
          <button className="step-btn" onClick={() => bump(100)}>＋</button>
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {[500,700,1000,1500,2000].map(v => (
            <button key={v} onClick={() => setLimit(String(v))}
              style={{padding:'5px 11px',borderRadius:20,border:'1px solid var(--border)',cursor:'pointer',
                background:parseInt(limit)===v?'var(--amber-d)':'var(--s2)',
                color:parseInt(limit)===v?'var(--amber)':'var(--muted)',fontSize:11,fontWeight:700}}>
              {fmt(v)}
            </button>
          ))}
        </div>

        <button className="btn-p" onClick={() => { onSave({ limit: parseInt(limit)||1000 }); onClose() }}>
          Salvar Limite ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
