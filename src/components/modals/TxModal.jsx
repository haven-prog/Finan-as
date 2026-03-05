import { useState, useEffect } from 'react'
import { CATS_OUT, CATS_IN } from '../../constants.js'
import { fmt, hoje, autoCat } from '../../utils.js'

export default function TxModal({ tx, gfs, defaultType, preGfId, onClose, onSave }) {
  const editing = !!tx
  const [type,   setType]   = useState(tx?.type  || defaultType || 'out')
  const [amount, setAmount] = useState(tx ? String(Math.abs(tx.amount)) : '')
  const [name,   setName]   = useState(tx?.name  || '')
  const [cat,    setCat]    = useState(tx?.cat ? (CATS_OUT.find(c => c.l === tx.cat) || CATS_OUT[0]).id : 'essen')
  const [owner,  setOwner]  = useState(tx?.owner === 'Gabi' ? 'A' : 'G')
  const [gfId,   setGfId]   = useState(tx?.gfId ?? preGfId ?? null)
  const [autoDetected, setAutoDetected] = useState(false)

  const cats = type === 'in' ? CATS_IN : CATS_OUT

  useEffect(() => {
    if (editing || type !== 'out') { setAutoDetected(false); return }
    const detected = autoCat(name)
    if (detected && CATS_OUT.find(c => c.id === detected)) {
      setCat(detected); setAutoDetected(true)
    } else { setAutoDetected(false) }
  }, [name, type, editing])

  const ownerName = owner === 'G' ? 'Gabriel' : 'Gabi'
  const availGfs  = gfs.filter(g => g.owner === 'Ambos' || g.owner === ownerName)

  function save() {
    const v = parseFloat(amount.replace(',', '.'))
    if (!v || isNaN(v)) return
    const c = cats.find(x => x.id === cat) || cats[0]
    onSave({
      id: tx?.id || Date.now(), name: name || c.l, cat: c.l, icon: c.e,
      amount: type === 'in' ? v : -v,
      owner:  owner === 'G' ? 'Gabriel' : 'Gabi',
      date:   tx?.date || hoje(), type,
      gfId:   type === 'out' ? gfId : null,
    })
  }

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">{editing ? 'Editar' : 'Novo Lançamento'}</div>
        <div className="sh-s">Rápido. Fácil. Pronto.</div>

        {!editing && (
          <div className="type-row">
            <button className={`type-b in ${type==='in'?'sel':''}`}
              onClick={() => { setType('in'); setCat('sal'); setGfId(null) }}>⬆️ Entrada</button>
            <button className={`type-b out ${type==='out'?'sel':''}`}
              onClick={() => { setType('out'); setCat('essen') }}>⬇️ Saída</button>
          </div>
        )}

        <div className="amtw">
          <div className="cur">R$</div>
          <input className="ain" placeholder="0,00" value={amount} type="number"
            onChange={e => setAmount(e.target.value)} autoFocus inputMode="decimal"/>
        </div>

        <div className="fl2">
          <label className="fl-lbl">Descrição (opcional)</label>
          <input className="fl-inp"
            placeholder={type==='in' ? 'Ex: Salário março' : 'Ex: Supermercado'}
            value={name} onChange={e => setName(e.target.value)}/>
          {autoDetected && (
            <div style={{fontSize:10,color:'var(--amber)',marginTop:4}}>✨ Categoria detectada automaticamente</div>
          )}
        </div>

        <label className="fl-lbl">Categoria</label>
        <div className="cats">
          {cats.map(c => (
            <div key={c.id} className={`cat ${cat===c.id?'sel':''}`}
              onClick={() => { setCat(c.id); setAutoDetected(false) }}>
              <div className="cat-e">{c.e}</div>
              <div className="cat-n">{c.l}</div>
            </div>
          ))}
        </div>

        <label className="fl-lbl">Quem?</label>
        <div className="own">
          <div className={`own-b ${owner==='G'?'sg':''}`} onClick={() => { setOwner('G'); setGfId(null) }}>
            <div className="av av-g" style={{width:26,height:26,fontSize:11,flexShrink:0}}>G</div>
            <div className="own-n">Gabriel</div>
          </div>
          <div className={`own-b ${owner==='A'?'sa':''}`} onClick={() => { setOwner('A'); setGfId(null) }}>
            <div className="av av-a" style={{width:26,height:26,fontSize:11,flexShrink:0}}>G</div>
            <div className="own-n">Gabi</div>
          </div>
        </div>

        {type==='out' && availGfs.length > 0 && (
          <>
            <label className="fl-lbl">Vincular a Gasto Fixo?</label>
            <div className="gf-pick-grid">
              {availGfs.map(g => (
                <div key={g.id} className={`gf-pick ${gfId===g.id?'sel':''}`}
                  onClick={() => setGfId(gfId===g.id ? null : g.id)}>
                  <div className="gf-pick-ico">{g.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="gf-pick-name">{g.name}</div>
                    <div style={{fontSize:9,color:'var(--muted)',fontWeight:700}}>Limite: {fmt(g.limit)}</div>
                  </div>
                </div>
              ))}
              <div className={`gf-pick-none ${!gfId?'sel':''}`} onClick={() => setGfId(null)}>Sem vínculo</div>
            </div>
          </>
        )}

        <button className={`btn-p ${type==='in'?'green':''}`} onClick={save} disabled={!amount}>
          {type==='in' ? '✅ Registrar Entrada' : '✅ Registrar Saída'}
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
