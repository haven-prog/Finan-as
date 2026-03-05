import { useState } from 'react'
import { GF_ICONS } from '../../constants.js'
import { fmt } from '../../utils.js'

export default function GFModal({ gf, goals, onClose, onSave }) {
  const editing  = !!gf
  const [name,   setName]   = useState(gf?.name  || '')
  const [icon,   setIcon]   = useState(gf?.icon  || '🏠')
  const [limit,  setLimit]  = useState(gf?.limit ? String(gf.limit) : '')
  const [owner,  setOwner]  = useState(gf?.owner || 'Ambos')
  const [recorr, setRecorr] = useState(gf?.recorrente !== false)
  const [goalId, setGoalId] = useState(gf?.goalId || null)

  const bump = d => setLimit(v => String(Math.max(0, (parseInt(v)||0)+d)))

  function save() {
    const l = parseInt(limit)||0
    if (!name||!l) return
    onSave({ id:gf?.id||Date.now(), name, icon, owner, limit:l, recorrente:recorr, goalId,
      color:gf?.color||'#a78bfa', bg:gf?.bg||'rgba(167,139,250,.1)' })
  }

  const linkedGoal = goals?.find(g => g.id === goalId)

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">{editing ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}</div>
        <div className="sh-s">Contas mensais, parcelas, assinaturas.</div>

        <label className="fl-lbl">Ícone</label>
        <div className="icon-g" style={{marginBottom:13}}>
          {GF_ICONS.map(e => (
            <div key={e} className={`icon-b ${icon===e?'sel':''}`} onClick={() => setIcon(e)}>{e}</div>
          ))}
        </div>

        <div className="fl2">
          <label className="fl-lbl">Nome</label>
          <input className="fl-inp" placeholder="Ex: Aluguel, Parcela Casa..." value={name} onChange={e => setName(e.target.value)}/>
        </div>

        <label className="fl-lbl">Limite mensal (R$)</label>
        <div className="step-row">
          <button className="step-btn" onClick={() => bump(-50)}>−</button>
          <div className="amtw step-inp" style={{margin:0,padding:'10px 14px'}}>
            <div className="cur" style={{fontSize:16}}>R$</div>
            <input className="ain" style={{fontSize:22}} placeholder="0" type="number" inputMode="numeric"
              value={limit} onChange={e => setLimit(e.target.value)}/>
          </div>
          <button className="step-btn" onClick={() => bump(50)}>＋</button>
        </div>
        <div style={{display:'flex',gap:7,marginBottom:13,flexWrap:'wrap'}}>
          {[100,200,350,500,1000,1200].map(v => (
            <button key={v} onClick={() => setLimit(String(v))}
              style={{padding:'4px 10px',borderRadius:20,border:'1px solid var(--border)',cursor:'pointer',
                background:parseInt(limit)===v?'var(--amber-d)':'var(--s2)',
                color:parseInt(limit)===v?'var(--amber)':'var(--muted)', fontSize:11,fontWeight:700}}>
              {fmt(v)}
            </button>
          ))}
        </div>

        <label className="fl-lbl">Responsável</label>
        <div className="own" style={{marginBottom:13}}>
          {['Gabriel','Gabi','Ambos'].map(o => (
            <div key={o}
              className={`own-b ${owner===o?(o==='Gabi'?'sa':'sg'):''}`}
              style={owner===o&&o==='Ambos'?{borderColor:'var(--amber)',background:'var(--amber-d)'}:{}}
              onClick={() => setOwner(o)}>
              {o==='Gabriel' && <div className="av av-g" style={{width:22,height:22,fontSize:9,flexShrink:0}}>G</div>}
              {o==='Gabi'    && <div className="av av-a" style={{width:22,height:22,fontSize:9,flexShrink:0}}>G</div>}
              {o==='Ambos'   && <span style={{fontSize:14}}>👫</span>}
              <div className="own-n" style={owner===o?{color:'var(--amber)'}:{}}>{o}</div>
            </div>
          ))}
        </div>

        <div className="toggle-row" onClick={() => setRecorr(r => !r)} style={{marginBottom:14}}>
          <div>
            <div className="toggle-lbl">🔄 Recorrente</div>
            <div className="toggle-sub">Aparece todo mês automaticamente</div>
          </div>
          <div className={`toggle-sw ${recorr?'on':''}`}/>
        </div>

        {goals?.length > 0 && (
          <>
            <label className="fl-lbl">🎯 Vincular a uma Meta?</label>
            <div style={{marginBottom:14}}>
              {goals.map(g => (
                <div key={g.id}
                  onClick={() => setGoalId(goalId===g.id ? null : g.id)}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 13px',borderRadius:12,marginBottom:7,cursor:'pointer',
                    border:`1.5px solid ${goalId===g.id?'var(--amber)':'var(--border)'}`,
                    background:goalId===g.id?'var(--amber-d)':'var(--s2)'}}>
                  <span style={{fontSize:20}}>{g.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:goalId===g.id?'var(--amber)':'var(--text)'}}>{g.name}</div>
                    {g.isParcela && <div style={{fontSize:9.5,color:'var(--muted)'}}>🏦 Parcela {g.parcelasPagas}/{g.parcelasTotal}</div>}
                  </div>
                  {goalId===g.id && <span style={{color:'var(--amber)',fontWeight:800}}>✓</span>}
                </div>
              ))}
              {goalId && <div style={{fontSize:10.5,color:'var(--green)',fontWeight:700,padding:'4px 0'}}>
                🔗 Pagamentos registrarão progresso em {linkedGoal?.emoji} {linkedGoal?.name}
              </div>}
            </div>
          </>
        )}

        <button className="btn-p" onClick={save} disabled={!name||!limit}>
          {editing ? 'Salvar Alterações ✓' : 'Criar Gasto Fixo ✓'}
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
