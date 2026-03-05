import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { useComputedFinance } from '../hooks/useComputedFinance'
import { ContribModal, GoalFormModal } from '../components/modals/Modals'
import Confirm from '../components/modals/Confirm'
import { fmt } from '../utils/format'

// ─── MetasPage ───────────────────────────────────────────────
export default function MetasPage() {
  const { goals, gfs, deleteGoal, deleteContrib, showCelebration } = useFinance()
  const { totals } = useComputedFinance()

  const [exp,      setExp]      = useState(null)
  const [ctGoal,   setCtGoal]   = useState(null)
  const [editG,    setEditG]    = useState(null)
  const [showNew,  setShowNew]  = useState(false)
  const [delGoal,  setDelGoal]  = useState(null)

  // Map gf.id → gf for parcela display
  const gfMap = Object.fromEntries(gfs.map(g => [g.id, g]))

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div className="D" style={{ fontSize: 23, fontWeight: 700, letterSpacing: -1 }}>Metas</div>
          <button onClick={() => setShowNew(true)}
            style={{ background: 'var(--amber-d)', border: '1px solid var(--amber)', color: 'var(--amber)', borderRadius: 11, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            ＋ Nova
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 13 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            Nenhuma meta ainda. Crie a primeira!
          </div>
        )}

        {goals.map(g => {
          const pct  = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
          const open = exp === g.id
          const meses = g.monthly > 0 && g.current < g.target
            ? Math.ceil((g.target - g.current) / g.monthly)
            : null

          // Parcelas vinculadas
          const linkedGfs = (g.parcelaGfIds || []).map(id => gfMap[id]).filter(Boolean)
          const parcelasTotal = linkedGfs.reduce((s, gf) => {
            const pc = gf.parcelaConfig
            return pc ? s + (pc.totalParcelas - pc.parcelaAtual) * gf.limit : s
          }, 0)

          const fc = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--amber)' : 'var(--blue)'
          const done = pct >= 100

          return (
            <div key={g.id}
              style={{
                background: done ? 'linear-gradient(135deg,#0b1810,#091510)' : 'var(--s1)',
                border: `1px solid ${done ? '#1a3322' : open ? 'var(--amber)' : 'var(--border)'}`,
                borderRadius: 18, overflow: 'hidden',
              }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExp(open ? null : g.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 11 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: done ? 'rgba(74,222,128,.15)' : 'var(--s2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {g.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: done ? 'var(--green)' : 'var(--text)', marginBottom: 2 }}>
                      {g.name}
                      {done && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'var(--green-d)', padding: '2px 7px', borderRadius: 20, marginLeft: 6 }}>META ✓</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {g.deadline && <span>📅 {g.deadline}</span>}
                      {meses && <><span>·</span><span>~{meses} meses</span></>}
                      {linkedGfs.length > 0 && <><span>·</span><span style={{ color: '#fb923c' }}>📦 {linkedGfs.length} parcela{linkedGfs.length > 1 ? 's' : ''}</span></>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Fraunces,serif', fontSize: 22, fontWeight: 700, color: done ? 'var(--green)' : 'var(--amber)', letterSpacing: -1 }}>{pct}%</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{open ? '▲' : '▼'}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 7, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: pct + '%', borderRadius: 100, background: fc, transition: 'width .7s cubic-bezier(.16,1,.3,1)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: done ? 'var(--green)' : 'var(--text)', fontFamily: 'Fraunces,serif' }}>{fmt(g.current)}</span>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}> de {fmt(g.target)}</span>
                  </div>
                  {g.monthly > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                      +{fmt(g.monthly)}/mês
                    </div>
                  )}
                </div>

                {/* Parcelas alert */}
                {parcelasTotal > 0 && (
                  <div style={{ marginTop: 8, background: 'rgba(251,146,60,.08)', border: '1px solid rgba(251,146,60,.25)', borderRadius: 10, padding: '7px 10px', fontSize: 10, color: '#fb923c', fontWeight: 700 }}>
                    📦 {fmt(parcelasTotal)} ainda a pagar em parcelas
                  </div>
                )}
              </div>

              {/* Expanded */}
              {open && (
                <div style={{ background: 'var(--s2)', borderTop: '1px solid var(--border)', padding: '12px 16px', animation: 'expIn .2s cubic-bezier(.16,1,.3,1)' }}>
                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 13 }}>
                    <button
                      onClick={() => setCtGoal(g)}
                      style={{ padding: '9px 4px', borderRadius: 12, border: '1px solid var(--amber)', background: 'var(--amber-d)', color: 'var(--amber)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 16 }}>💰</span>Aportar
                    </button>
                    <button
                      onClick={() => setEditG(g)}
                      style={{ padding: '9px 4px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--s1)', color: 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 16 }}>✏️</span>Editar
                    </button>
                    <button
                      onClick={() => setDelGoal(g)}
                      style={{ padding: '9px 4px', borderRadius: 12, border: '1px solid rgba(255,107,107,.3)', background: 'var(--coral-d)', color: 'var(--coral)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 16 }}>🗑️</span>Excluir
                    </button>
                  </div>

                  {/* Linked parcelas */}
                  {linkedGfs.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: '#fb923c', marginBottom: 7 }}>📦 Parcelas vinculadas</div>
                      {linkedGfs.map(gf => {
                        const pc = gf.parcelaConfig
                        const pfPct = pc ? Math.round((pc.parcelaAtual / pc.totalParcelas) * 100) : 0
                        return (
                          <div key={gf.id} style={{ background: 'var(--s1)', border: '1px solid rgba(251,146,60,.2)', borderRadius: 11, padding: '10px 12px', marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span style={{ fontSize: 16 }}>{gf.icon}</span>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{gf.name}</div>
                                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                                    Parcela {pc?.parcelaAtual}/{pc?.totalParcelas} · {fmt(gf.limit)}/mês
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'Fraunces,serif', fontSize: 13, fontWeight: 700, color: '#fb923c' }}>{fmt((pc.totalParcelas - pc.parcelaAtual) * gf.limit)}</div>
                                <div style={{ fontSize: 9, color: 'var(--muted)' }}>restante</div>
                              </div>
                            </div>
                            <div style={{ height: 4, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pfPct + '%', background: '#fb923c', borderRadius: 100 }} />
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}

                  {/* Contrib history */}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 7 }}>📋 Histórico de Aportes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {!(g.contribs?.length) && (
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', padding: 12 }}>Nenhum aporte ainda.</div>
                    )}
                    {(g.contribs || []).map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)' }}>{c.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--muted)' }}>{c.date} · {c.owner}</div>
                        </div>
                        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 13, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>+{fmt(c.amount)}</div>
                        <button
                          onClick={() => deleteContrib(g.id, c.id)}
                          style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--coral-d)', border: 'none', color: 'var(--coral)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button
          onClick={() => setShowNew(true)}
          style={{ width: '100%', padding: 14, borderRadius: 16, background: 'var(--s1)', border: '1.5px dashed var(--border)', color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <span style={{ fontSize: 18 }}>＋</span> Nova Meta
        </button>
      </div>

      {(showNew || editG) && (
        <GoalFormModal goal={editG} onClose={() => { setShowNew(false); setEditG(null) }} />
      )}
      {ctGoal && (
        <ContribModal goal={ctGoal} saldo={totals.saldo} onClose={() => setCtGoal(null)} />
      )}
      {delGoal && (
        <Confirm
          title="Excluir meta?"
          msg={`Excluir "${delGoal.name}"? Todo o histórico de aportes será perdido.`}
          onYes={() => { deleteGoal(delGoal.id); setDelGoal(null); setExp(null) }}
          onNo={() => setDelGoal(null)}
        />
      )}
    </div>
  )
}
