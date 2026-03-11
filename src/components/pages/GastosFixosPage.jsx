import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext.jsx'
import GFModal from '../modals/GFModal.jsx'
import Confirm from '../modals/Confirm.jsx'
import { fmt } from '../../utils.js'

export default function GastosFixosPage({ onOpenTxForGf }) {
  const { txs, gfs, goals, gfData, dispatch } = useFinance()
  const [exp,    setExp]    = useState(null)
  const [editGf, setEditGf] = useState(null)
  const [newGf,  setNewGf]  = useState(false)
  const [delGf,  setDelGf]  = useState(null)

  const totalLimit = gfs.reduce((s,g) => s + g.limit, 0)
  const totalGasto = gfs.reduce((s,g) => s + (gfData[g.id]?.total || 0), 0)
  const pendentes  = gfs.filter(g => (gfData[g.id]?.total || 0) < g.limit).length

  function saveGf(g) {
    const newGfs = editGf ? gfs.map(x => x.id===g.id ? {...x,...g} : x) : [...gfs, g]
    dispatch({ type:'SET_GFS', gfs:newGfs })
    setEditGf(null); setNewGf(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:28, letterSpacing:'-.5px' }}>
            Gastos Fixos
          </div>
          <button onClick={() => setNewGf(true)} style={{
            background:'var(--amber-d)', border:'1px solid rgba(240,165,0,.25)',
            color:'var(--amber)', borderRadius:20, padding:'7px 14px',
            fontSize:12, fontWeight:600, cursor:'pointer',
          }}>
            + Novo
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div style={{ padding:'0 22px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:18, padding:'16px 18px', gridColumn:'1/-1' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--sub)', marginBottom:6 }}>Pago este mês</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }}>
            <div style={{ fontFamily:'Instrument Serif,serif', fontSize:32, letterSpacing:-1 }}>
              {fmt(totalGasto)}
            </div>
            <div style={{ fontSize:13, color:'var(--sub)', paddingBottom:4 }}>de {fmt(totalLimit)}</div>
          </div>
          <div style={{ height:4, background:'var(--s3)', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
            <div style={{
              height:'100%', borderRadius:99, transition:'width .5s',
              width:`${totalLimit>0?Math.min(100,(totalGasto/totalLimit)*100):0}%`,
              background: totalGasto > totalLimit ? 'var(--coral)' : totalGasto/totalLimit > .8 ? 'var(--amber)' : 'var(--green)',
            }}/>
          </div>
          {pendentes > 0 && (
            <div style={{ fontSize:11, color:'var(--sub)' }}>
              {pendentes} conta{pendentes>1?'s':''} ainda a pagar
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="gf-list">
        {gfs.map(g => {
          const d    = gfData[g.id] || { total:0, gabriel:0, gabi:0, txs:[] }
          const pct  = g.limit > 0 ? Math.round((d.total / g.limit) * 100) : 0
          const resto = g.limit - d.total
          const fc   = pct >= 100 ? 'var(--coral)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
          const open = exp === g.id
          const linkedGoal = goals.find(gl => gl.id === g.goalId)

          return (
            <div key={g.id} className={`gf${open?' exp':''}${pct>=100?' over':''}`}>
              <div className="gf-head" onClick={() => setExp(open ? null : g.id)}>
                <div className="gf-top">
                  <div className="gf-ico" style={{ background: pct>=100?'var(--coral-d)':pct>=80?'var(--amber-d)':'var(--s2)' }}>
                    {g.icon}
                  </div>
                  <div className="gf-info">
                    <div className="gf-name">{g.name}</div>
                    <div className="gf-meta">
                      <span>{g.owner}</span>
                      {g.recorrente && <><div className="gf-dot"/><span>Recorrente</span></>}
                      {linkedGoal && <><div className="gf-dot"/><span style={{ color:'var(--amber)' }}>🎯 {linkedGoal.name}</span></>}
                    </div>
                  </div>
                  <div className="gf-right">
                    <div className="gf-spent" style={{ color:fc }}>{fmt(d.total)}</div>
                    <div className="gf-limit">de {fmt(g.limit)}</div>
                  </div>
                </div>

                <div className="gf-bar">
                  <div className="gf-fill" style={{ width:Math.min(pct,100)+'%', background:fc }}/>
                </div>
                <div className="gf-foot">
                  <div className="gf-pct">
                    {d.total === 0
                      ? <span style={{ color:'var(--sub)' }}>Não pago</span>
                      : `${pct}%`
                    }
                  </div>
                  <div className="gf-rest" style={{ color:resto<0?'var(--coral)':resto<g.limit*.2?'var(--amber)':'var(--green)' }}>
                    {resto >= 0 ? `${fmt(resto)} restante` : `${fmt(Math.abs(resto))} acima`}
                  </div>
                </div>

                {/* Split */}
                {(d.gabriel > 0 || d.gabi > 0) && (
                  <div className="gf-persons" style={{ marginTop:10 }}>
                    <div className="gf-person">
                      <div className="gf-person-av av-g">G</div>
                      <div className="gf-person-name">Gabriel</div>
                      <div className="gf-person-val" style={{ color:'var(--amber)' }}>{fmt(d.gabriel)}</div>
                    </div>
                    <div className="gf-person">
                      <div className="gf-person-av av-a">G</div>
                      <div className="gf-person-name">Gabi</div>
                      <div className="gf-person-val" style={{ color:'var(--coral)' }}>{fmt(d.gabi)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expandido */}
              {open && (
                <div className="gf-expand">
                  <div className="gf-acts">
                    <button className="gf-act" onClick={() => onOpenTxForGf(g)}>
                      <span>⬇️</span> Lançar
                    </button>
                    <button className="gf-act" onClick={() => setEditGf(g)}>
                      <span>✏️</span> Editar
                    </button>
                    <button className="gf-act danger" onClick={() => setDelGf(g)}>
                      <span>🗑️</span> Excluir
                    </button>
                  </div>
                  <div className="gf-txs-title">Lançamentos vinculados</div>
                  {d.txs.length === 0 ? (
                    <div className="gf-no-tx">Nenhum lançamento ainda.</div>
                  ) : (
                    d.txs.map(t => (
                      <div key={t.id} className="gf-tx">
                        <div className="gf-tx-ic">{t.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="gf-tx-n">{t.name}</div>
                          <div className="gf-tx-sub">{t.date} · {t.owner}</div>
                        </div>
                        <div className="gf-tx-a">{fmt(Math.abs(t.amount))}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}

        <button className="add-gf" onClick={() => setNewGf(true)}>
          + Novo Gasto Fixo
        </button>
      </div>

      {(newGf || editGf) && (
        <GFModal gf={editGf} goals={goals}
          onClose={() => { setNewGf(false); setEditGf(null) }}
          onSave={saveGf}/>
      )}
      {delGf && (
        <Confirm
          title="Excluir gasto fixo?"
          msg={`Excluir "${delGf.name}"? Os lançamentos vinculados perderão a referência.`}
          onYes={() => { dispatch({ type:'SET_GFS', gfs:gfs.filter(g => g.id!==delGf.id) }); setDelGf(null); setExp(null) }}
          onNo={() => setDelGf(null)}
        />
      )}
    </div>
  )
}
