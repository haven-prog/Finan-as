import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { useComputedFinance } from '../hooks/useComputedFinance'
import GFModal from '../components/modals/GFModal'
import Confirm from '../components/modals/Confirm'
import { fmt } from '../utils/format'

// ─── GastosFixosPage ─────────────────────────────────────────
export default function GastosFixosPage({ onOpenTxForGf }) {
  const { gfs, goals, deleteGf } = useFinance()
  const { gfData } = useComputedFinance()
  const [exp,    setExp]    = useState(null)
  const [editGf, setEditGf] = useState(null)
  const [newGf,  setNewGf]  = useState(false)
  const [delGf,  setDelGf]  = useState(null)

  const totalLimit = gfs.reduce((s, g) => s + g.limit, 0)
  const totalGasto = gfs.reduce((s, g) => s + (gfData[g.id]?.total || 0), 0)
  const totalResto = totalLimit - totalGasto

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-row">
          <div className="D" style={{ fontSize: 23, fontWeight: 700, letterSpacing: -1 }}>Gastos Fixos</div>
          <button
            onClick={() => setNewGf(true)}
            style={{ background: 'var(--amber-d)', border: '1px solid var(--amber)', color: 'var(--amber)', borderRadius: 11, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            ＋ Novo
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="gf-summary">
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Orçado</div>
          <div className="gf-sum-val c-am">{fmt(totalLimit)}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{gfs.length} contas</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Pago</div>
          <div className="gf-sum-val" style={{ color: totalGasto > totalLimit ? 'var(--coral)' : 'var(--text)' }}>{fmt(totalGasto)}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{totalLimit > 0 ? Math.round((totalGasto / totalLimit) * 100) : 0}%</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">A Pagar</div>
          <div className="gf-sum-val" style={{ color: totalResto > 0 ? 'var(--coral)' : 'var(--green)' }}>{fmt(Math.max(0, totalResto))}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{gfs.filter(g => (gfData[g.id]?.total || 0) < g.limit).length} pendentes</div>
        </div>
        <div className="gf-sum-card">
          <div className="gf-sum-lbl">Parcelas</div>
          <div className="gf-sum-val" style={{ color: '#fb923c' }}>{fmt(gfs.filter(g => g.parcelaConfig).reduce((s, g) => s + (g.parcelaConfig.totalParcelas - g.parcelaConfig.parcelaAtual) * g.limit, 0))}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>comprometido</div>
        </div>
      </div>

      <div className="gf-list">
        {gfs.map(g => {
          const d    = gfData[g.id] || { total: 0, gabriel: 0, gabi: 0, txs: [] }
          const pct  = g.limit > 0 ? Math.round((d.total / g.limit) * 100) : 0
          const fc   = pct >= 100 ? '#f87171' : pct >= 80 ? 'var(--amber)' : g.color
          const open = exp === g.id
          const resto = g.limit - d.total
          const linkedMeta = g.parcelaConfig?.metaId
            ? goals.find(m => m.id === g.parcelaConfig.metaId)
            : null

          return (
            <div key={g.id} className={`gf ${open ? 'exp' : ''} ${pct >= 100 ? 'over' : ''}`}>
              <div className="gf-head" onClick={() => setExp(open ? null : g.id)}>
                <div className="gf-top">
                  <div className="gf-ico" style={{ background: g.bg }}>{g.icon}</div>
                  <div className="gf-info">
                    <div className="gf-name">
                      {g.name}
                      {g.parcelaConfig && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fb923c', background: 'rgba(251,146,60,.15)', padding: '2px 6px', borderRadius: 20, marginLeft: 5 }}>
                          PARCELA {g.parcelaConfig.parcelaAtual}/{g.parcelaConfig.totalParcelas}
                        </span>
                      )}
                    </div>
                    <div className="gf-meta">
                      <span>👤 {g.owner}</span>
                      {g.recorrente && <><div className="gf-dot" /><span>🔄</span></>}
                      <div className="gf-dot" /><span>Limite: {fmt(g.limit)}</span>
                      {linkedMeta && <><div className="gf-dot" /><span style={{ color: 'var(--amber)' }}>{linkedMeta.emoji} {linkedMeta.name}</span></>}
                    </div>
                  </div>
                  <div className="gf-right">
                    <div className="gf-spent" style={{ color: pct >= 100 ? 'var(--coral)' : pct >= 80 ? 'var(--amber)' : 'var(--text)' }}>{fmt(d.total)}</div>
                    <div className="gf-limit">{pct}% pago</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{open ? '▲' : '▼'}</div>
                  </div>
                </div>

                <div className="gf-bar"><div className="gf-fill" style={{ width: Math.min(pct, 100) + '%', background: fc }} /></div>
                <div className="gf-foot">
                  <div className="gf-pct">{pct}% do limite</div>
                  <div className="gf-rest" style={{ color: resto < 0 ? 'var(--coral)' : resto < g.limit * 0.2 ? 'var(--amber)' : 'var(--green)' }}>
                    {resto >= 0 ? `${fmt(resto)} restante` : `${fmt(Math.abs(resto))} acima`}
                  </div>
                </div>

                {pct >= 80 && pct < 100 && <div className="gf-tag gf-tag-warn">⚠ {pct}% do limite usado</div>}
                {pct >= 100 && <div className="gf-tag gf-tag-over">🚨 Limite ultrapassado!</div>}
                {d.total === 0 && <div className="gf-tag" style={{ color: 'var(--blue)', background: 'var(--blue-d)' }}>⏳ Ainda não pago</div>}

                {/* Person split */}
                {(d.gabriel > 0 || d.gabi > 0) && (
                  <div className="gf-persons">
                    <div className="gf-person">
                      <div className="gf-person-av av-g">G</div>
                      <div className="gf-person-name">Gabriel</div>
                      <div className="gf-person-val" style={{ color: 'var(--amber)' }}>{fmt(d.gabriel)}</div>
                    </div>
                    <div className="gf-person">
                      <div className="gf-person-av av-a">G</div>
                      <div className="gf-person-name">Gabi</div>
                      <div className="gf-person-val" style={{ color: 'var(--coral)' }}>{fmt(d.gabi)}</div>
                    </div>
                  </div>
                )}

                {/* Parcela progress */}
                {g.parcelaConfig && (
                  <div style={{ background: 'rgba(251,146,60,.08)', border: '1px solid rgba(251,146,60,.2)', borderRadius: 11, padding: '9px 11px', marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>📦 Financiamento total</div>
                      <div style={{ fontFamily: 'Fraunces,serif', fontSize: 13, fontWeight: 700, color: '#fb923c' }}>{fmt(g.parcelaConfig.valorTotal)}</div>
                    </div>
                    <div style={{ height: 4, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: Math.round((g.parcelaConfig.parcelaAtual / g.parcelaConfig.totalParcelas) * 100) + '%', borderRadius: 100, background: '#fb923c' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>
                      {g.parcelaConfig.parcelaAtual}/{g.parcelaConfig.totalParcelas} parcelas · {g.parcelaConfig.totalParcelas - g.parcelaConfig.parcelaAtual} restantes · {fmt((g.parcelaConfig.totalParcelas - g.parcelaConfig.parcelaAtual) * g.limit)} ainda a pagar
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded */}
              {open && (
                <div className="gf-expand">
                  <div className="gf-acts">
                    <button className="gf-act" onClick={() => onOpenTxForGf(g)}>
                      <span style={{ fontSize: 16 }}>⬇️</span>Lançar
                    </button>
                    <button className="gf-act" onClick={() => setEditGf(g)}>
                      <span style={{ fontSize: 16 }}>✏️</span>Editar
                    </button>
                    <button className="gf-act danger" onClick={() => setDelGf(g)}>
                      <span style={{ fontSize: 16 }}>🗑️</span>Excluir
                    </button>
                  </div>
                  <div className="gf-txs-title">📋 Lançamentos vinculados</div>
                  {d.txs.length === 0
                    ? <div className="gf-no-tx">Nenhum lançamento ainda.<br />Toque em "Lançar" para registrar.</div>
                    : d.txs.map(t => (
                      <div key={t.id} className="gf-tx">
                        <div className="gf-tx-ic">{t.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="gf-tx-n">{t.name}</div>
                          <div className="gf-tx-sub">{t.date} · {t.owner}</div>
                        </div>
                        <div className="gf-tx-a">{fmt(Math.abs(t.amount))}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
        <button className="add-gf" onClick={() => setNewGf(true)}>
          <span style={{ fontSize: 18 }}>＋</span> Novo Gasto Fixo
        </button>
      </div>

      {(newGf || editGf) && (
        <GFModal gf={editGf} onClose={() => { setNewGf(false); setEditGf(null) }} />
      )}
      {delGf && (
        <Confirm
          title="Excluir gasto fixo?"
          msg={`Excluir "${delGf.name}"? Os lançamentos vinculados perdem a referência.`}
          onYes={() => { deleteGf(delGf.id); setDelGf(null); setExp(null) }}
          onNo={() => setDelGf(null)}
        />
      )}
    </div>
  )
}
