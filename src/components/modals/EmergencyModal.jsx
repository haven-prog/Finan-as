import { useState } from 'react'
import { fmt } from '../../utils.js'

import { useFinance } from '../../context/FinanceContext.jsx'
export default function EmergencyModal({ onClose, onSave }) {
  const { emergency } = useFinance()
  const [current, setCurrent] = useState(String(emergency.current))
  const [target,  setTarget]  = useState(String(emergency.target))

  const bumpC = d => setCurrent(v => String(Math.max(0,(parseInt(v)||0)+d)))
  const bumpT = d => setTarget( v => String(Math.max(0,(parseInt(v)||0)+d)))

  function save() {
    const c = parseInt(current)||0, t = parseInt(target)||0
    if (t <= 0) return
    onSave({ current:c, target:t })
  }

  const pct = parseInt(target)>0 ? Math.min(100,Math.round((parseInt(current)||0)/(parseInt(target)||1)*100)) : 0

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">Reserva de Emergência</div>
        <div className="sh-s">🛡 Edite o valor atual e a meta alvo.</div>

        <div style={{background:'linear-gradient(135deg,#0b1810,#091510)',border:'1px solid #1a3322',borderRadius:16,padding:14,marginBottom:16,textAlign:'center'}}>
          <div style={{fontFamily:'Fraunces,serif',fontSize:30,fontWeight:700,color:'var(--text)',letterSpacing:-1,marginBottom:4}}>{fmt(parseInt(current)||0)}</div>
          <div style={{fontSize:10,color:'rgba(74,222,128,.5)',marginBottom:10}}>de {fmt(parseInt(target)||0)} · {pct}%</div>
          <div style={{height:8,background:'#0f2218',borderRadius:100,overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',borderRadius:100,background:'linear-gradient(90deg,#22c55e,#4ade80)',transition:'width .5s'}}/>
          </div>
        </div>

        <label className="fl-lbl">Valor atual guardado (R$)</label>
        <div className="step-row" style={{marginBottom:14}}>
          <button className="step-btn" onClick={() => bumpC(-500)}>−</button>
          <div className="amtw step-inp" style={{margin:0,padding:'10px 14px'}}>
            <div className="cur" style={{fontSize:16}}>R$</div>
            <input className="ain" style={{fontSize:22}} placeholder="0" type="number" inputMode="numeric"
              value={current} onChange={e => setCurrent(e.target.value)}/>
          </div>
          <button className="step-btn" onClick={() => bumpC(500)}>＋</button>
        </div>

        <label className="fl-lbl">Meta alvo (R$)</label>
        <div className="step-row" style={{marginBottom:14}}>
          <button className="step-btn" onClick={() => bumpT(-1000)}>−</button>
          <div className="amtw step-inp" style={{margin:0,padding:'10px 14px'}}>
            <div className="cur" style={{fontSize:16}}>R$</div>
            <input className="ain" style={{fontSize:22}} placeholder="0" type="number" inputMode="numeric"
              value={target} onChange={e => setTarget(e.target.value)}/>
          </div>
          <button className="step-btn" onClick={() => bumpT(1000)}>＋</button>
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {[10000,15000,20000,30000,50000].map(v => (
            <button key={v} onClick={() => setTarget(String(v))}
              style={{padding:'5px 11px',borderRadius:20,border:'1px solid var(--border)',cursor:'pointer',
                background:parseInt(target)===v?'var(--green-d)':'var(--s2)',
                color:parseInt(target)===v?'var(--green)':'var(--muted)',fontSize:11,fontWeight:700}}>
              {fmt(v)}
            </button>
          ))}
        </div>

        <button className="btn-p green" onClick={save}>Salvar Reserva ✓</button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
