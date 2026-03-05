import { useState } from 'react'
import { fmt, hoje, nextId } from '../../utils.js'

export default function ContribModal({ goal, saldo, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [label,  setLabel]  = useState('')
  const [owner,  setOwner]  = useState('G')

  const v        = parseFloat(amount.replace(',','.')) || 0
  const saldoPos = saldo - v

  function save() {
    if (!v||isNaN(v)) return
    onSave({ id:nextId(goal.contribs||[]), label:label||'Aporte', amount:v, date:hoje(), owner:owner==='G'?'Gabriel':'Gabi' })
  }

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">Adicionar Aporte</div>
        <div className="sh-s">em <strong style={{color:'var(--amber)'}}>{goal.emoji} {goal.name}</strong></div>

        <div className="amtw">
          <div className="cur">R$</div>
          <input className="ain" placeholder="0" type="number" inputMode="decimal"
            value={amount} onChange={e => setAmount(e.target.value)} autoFocus/>
        </div>

        {v > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div style={{background:'var(--s2)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:9.5,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>Saldo atual</div>
              <div style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:700,color:'var(--text)'}}>{fmt(saldo)}</div>
            </div>
            <div style={{background:'var(--coral-d)',border:'1px solid var(--coral)',borderRadius:12,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:9.5,fontWeight:700,color:'var(--coral)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>Saldo após</div>
              <div style={{fontFamily:'Fraunces,serif',fontSize:16,fontWeight:700,color:saldoPos<0?'var(--coral)':'var(--text)'}}>{fmt(saldoPos)}</div>
            </div>
          </div>
        )}

        <div className="fl2">
          <label className="fl-lbl">Descrição</label>
          <input className="fl-inp" placeholder="Ex: Bônus do trabalho" value={label} onChange={e => setLabel(e.target.value)}/>
        </div>

        <label className="fl-lbl">Quem aporta?</label>
        <div className="own">
          <div className={`own-b ${owner==='G'?'sg':''}`} onClick={() => setOwner('G')}>
            <div className="av av-g" style={{width:26,height:26,fontSize:11,flexShrink:0}}>G</div>
            <div className="own-n">Gabriel</div>
          </div>
          <div className={`own-b ${owner==='A'?'sa':''}`} onClick={() => setOwner('A')}>
            <div className="av av-a" style={{width:26,height:26,fontSize:11,flexShrink:0}}>G</div>
            <div className="own-n">Gabi</div>
          </div>
        </div>

        <div className="inv-notice">💡 O aporte será registrado como saída nos lançamentos.</div>

        <button className="btn-p green" style={{marginTop:12}} onClick={save} disabled={!amount}>
          Confirmar Aporte ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
