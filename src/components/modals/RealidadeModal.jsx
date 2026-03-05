import { useState } from 'react'
import { fmt } from '../../utils.js'

export default function RealidadeModal({ appSaldo, onClose, onReconcile }) {
  const [bankStr, setBankStr] = useState('')

  const bank = parseFloat(bankStr.replace(',','.')) || null
  const diff = bank !== null ? bank - appSaldo : null
  const diffAbs = diff !== null ? Math.abs(diff) : 0

  function confirm() {
    if (diff === null || diff === 0) return
    onReconcile(diff)
  }

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">⚖️ Modo Realidade</div>
        <div className="sh-s">Compare o app com seu banco e corrija divergências.</div>

        <div style={{background:'var(--s2)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>App diz que seu saldo é</div>
          <div style={{fontFamily:'Fraunces,serif',fontSize:32,fontWeight:700,letterSpacing:-1,color:appSaldo<0?'var(--coral)':'var(--amber)'}}>
            {appSaldo<0?'−':''}{fmt(appSaldo)}
          </div>
        </div>

        <div className="fl2">
          <label className="fl-lbl">Quanto seu banco mostra agora? (R$)</label>
          <div className="amtw">
            <div className="cur">R$</div>
            <input className="ain" placeholder="0,00" type="number" inputMode="decimal"
              value={bankStr} onChange={e => setBankStr(e.target.value)} autoFocus/>
          </div>
        </div>

        {diff !== null && (
          <div style={{
            background: diff===0 ? 'var(--green-d)' : diff>0 ? 'var(--green-d)' : 'var(--coral-d)',
            border: `1px solid ${diff===0?'var(--green)':diff>0?'var(--green)':'var(--coral)'}`,
            borderRadius:14, padding:'14px 16px', marginBottom:16,
          }}>
            {diff === 0 ? (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>✅</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>Tudo certinho! App e banco batem.</div>
              </div>
            ) : (
              <>
                <div style={{fontSize:10,fontWeight:700,color:diff>0?'var(--green)':'var(--coral)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>
                  {diff > 0 ? '↑ Banco tem mais' : '↓ Banco tem menos'} — Diferença
                </div>
                <div style={{fontFamily:'Fraunces,serif',fontSize:28,fontWeight:700,letterSpacing:-1,color:diff>0?'var(--green)':'var(--coral)'}}>
                  {diff>0?'+':'-'}{fmt(diffAbs)}
                </div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:6,lineHeight:1.5}}>
                  Isso pode ser um lançamento esquecido. Ajustar cria uma transação de conciliação.
                </div>
              </>
            )}
          </div>
        )}

        {diff !== null && diff !== 0 && (
          <button className="btn-p" onClick={confirm}>
            Criar Ajuste de {diff>0?'Entrada':'Saída'} ({diff>0?'+':'-'}{fmt(diffAbs)})
          </button>
        )}
        <button className="btn-s" onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}
