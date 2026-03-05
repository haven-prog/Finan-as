import { useState } from 'react'
import { EMOJIS } from '../../constants.js'

export default function GoalModal({ goal, onClose, onSave }) {
  const [name,       setName]   = useState(goal?.name    || '')
  const [emoji,      setEmoji]  = useState(goal?.emoji   || '✈️')
  const [target,     setTarget] = useState(goal?.target  ? String(goal.target)  : '')
  const [curr,       setCurr]   = useState(goal?.current ? String(goal.current) : '')
  const [dead,       setDead]   = useState(goal?.deadline || '')
  const [mo,         setMo]     = useState(goal?.monthly ? String(goal.monthly) : '')
  const [isParcela,  setIsP]    = useState(goal?.isParcela || false)
  const [pVal,       setPVal]   = useState(goal?.parcelaValor  ? String(goal.parcelaValor)  : '')
  const [pTotal,     setPTotal] = useState(goal?.parcelasTotal ? String(goal.parcelasTotal) : '')

  /* ── BUG FIX: condição de save separada por modo ── */
  const canSave = isParcela
    ? (name.trim() && parseFloat(pVal) > 0 && parseInt(pTotal) > 0)
    : (name.trim() && parseFloat(target) > 0)

  function save() {
    if (!canSave) return
    if (isParcela) {
      const pv = parseFloat(pVal)
      const pt = parseInt(pTotal)
      onSave({
        id: goal?.id || Date.now(),
        name: name.trim(), emoji,
        target:        pv * pt,
        current:       goal?.current || 0,
        monthly:       pv,
        deadline:      dead,
        contribs:      goal?.contribs || [],
        isParcela:     true,
        parcelaValor:  pv,
        parcelasTotal: pt,
        parcelasPagas: goal?.parcelasPagas || 0,
        linkedGfId:    goal?.linkedGfId || null,
      })
    } else {
      onSave({
        id: goal?.id || Date.now(),
        name: name.trim(), emoji,
        target:        parseFloat(target),
        current:       parseFloat(curr) || 0,
        monthly:       parseFloat(mo)   || 0,
        deadline:      dead,
        contribs:      goal?.contribs || [],
        isParcela:     false,
        parcelaValor:  0,
        parcelasTotal: 0,
        parcelasPagas: 0,
        linkedGfId:    null,
      })
    }
  }

  const totalCalc = pVal && pTotal ? parseFloat(pVal) * parseInt(pTotal) : 0

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">{goal ? 'Editar Meta' : 'Nova Meta'}</div>
        <div className="sh-s">Defina seu próximo objetivo.</div>

        <label className="fl-lbl">Ícone</label>
        <div className="emo-g">
          {EMOJIS.map(e => (
            <div key={e} className={`emo-b ${emoji === e ? 'sel' : ''}`} onClick={() => setEmoji(e)}>{e}</div>
          ))}
        </div>

        <div className="fl2">
          <label className="fl-lbl">Nome da meta</label>
          <input className="fl-inp" placeholder="Ex: Viagem Europa" value={name}
            onChange={e => setName(e.target.value)}/>
        </div>

        {/* Toggle parcelas */}
        <div className="toggle-row" onClick={() => setIsP(p => !p)} style={{ marginBottom: 13 }}>
          <div>
            <div className="toggle-lbl">🏦 Financiamento / Parcelas</div>
            <div className="toggle-sub">Para compras parceladas ou financiamentos</div>
          </div>
          <div className={`toggle-sw ${isParcela ? 'on' : ''}`}/>
        </div>

        {isParcela ? (
          <>
            <div className="g2">
              <div>
                <label className="fl-lbl">Valor da parcela (R$)</label>
                <input className="fl-inp" placeholder="Ex: 1200" type="number" inputMode="decimal"
                  value={pVal} onChange={e => setPVal(e.target.value)}/>
              </div>
              <div>
                <label className="fl-lbl">Nº de parcelas</label>
                <input className="fl-inp" placeholder="Ex: 120" type="number" inputMode="numeric"
                  value={pTotal} onChange={e => setPTotal(e.target.value)}/>
              </div>
            </div>
            {totalCalc > 0 && (
              <div style={{ background:'var(--blue-d)', border:'1px solid rgba(96,165,250,.3)',
                borderRadius:11, padding:'10px 14px', marginBottom:13 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(96,165,250,.6)',
                  textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Total do financiamento</div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:700,
                  color:'var(--blue)', letterSpacing:-1 }}>
                  R${new Intl.NumberFormat('pt-BR').format(totalCalc)}
                </div>
                <div style={{ fontSize:10.5, color:'var(--muted)', marginTop:4 }}>
                  💡 Vincule ao Gasto Fixo correspondente para rastreio automático por parcela.
                </div>
              </div>
            )}
            <div className="fl2">
              <label className="fl-lbl">Prazo / Término</label>
              <input className="fl-inp" placeholder="Ex: Dez 2034" value={dead}
                onChange={e => setDead(e.target.value)}/>
            </div>
          </>
        ) : (
          <>
            <div className="g2">
              <div>
                <label className="fl-lbl">Total (R$)</label>
                <input className="fl-inp" placeholder="15000" type="number" inputMode="decimal"
                  value={target} onChange={e => setTarget(e.target.value)}/>
              </div>
              <div>
                <label className="fl-lbl">Já guardado (R$)</label>
                <input className="fl-inp" placeholder="0" type="number" inputMode="decimal"
                  value={curr} onChange={e => setCurr(e.target.value)}/>
              </div>
            </div>
            <div className="g2">
              <div>
                <label className="fl-lbl">Aporte/mês (R$)</label>
                <input className="fl-inp" placeholder="500" type="number" inputMode="decimal"
                  value={mo} onChange={e => setMo(e.target.value)}/>
              </div>
              <div>
                <label className="fl-lbl">Prazo</label>
                <input className="fl-inp" placeholder="Dez 2025" value={dead}
                  onChange={e => setDead(e.target.value)}/>
              </div>
            </div>
          </>
        )}

        <button className="btn-p" onClick={save} disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.45 }}>
          Salvar Meta ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
