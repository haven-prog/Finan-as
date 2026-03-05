import { useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { fmt, hoje } from '../../utils/format'

// ─── ContribModal ────────────────────────────────────────────
export function ContribModal({ goal, saldo, onClose }) {
  const { addContrib, showCelebration } = useFinance()
  const [amount, setAmount] = useState('')
  const [label,  setLabel]  = useState('')
  const [owner,  setOwner]  = useState('G')

  const v = parseFloat(amount.replace(',', '.')) || 0
  const saldoApos = saldo - v

  function save() {
    if (!v) return
    const contrib = {
      id:     Date.now(),
      label:  label || 'Aporte',
      amount: v,
      date:   hoje(),
      owner:  owner === 'G' ? 'Gabriel' : 'Gabi',
    }
    addContrib(goal.id, contrib, true)
    const newCurrent = goal.current + v
    if (newCurrent >= goal.target) {
      showCelebration(`🏆 ${goal.name} concluída!\nParabéns ao casal!`, '🎊')
    }
    onClose()
  }

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">Adicionar Aporte</div>
        <div className="sh-s">em <strong style={{ color: 'var(--amber)' }}>{goal.emoji} {goal.name}</strong></div>

        <div className="amtw">
          <div className="cur">R$</div>
          <input className="ain" placeholder="0" type="number" inputMode="decimal"
            value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>

        {v > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>Saldo atual</div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 700 }}>{fmt(saldo)}</div>
            </div>
            <div style={{ background: saldoApos < 0 ? 'var(--coral-d)' : 'var(--green-d)', border: `1px solid ${saldoApos < 0 ? 'var(--coral)' : 'var(--green)'}`, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: saldoApos < 0 ? 'var(--coral)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>Saldo após</div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 700, color: saldoApos < 0 ? 'var(--coral)' : 'var(--text)' }}>{fmt(saldoApos)}</div>
            </div>
          </div>
        )}

        <div className="fl2">
          <label className="fl-lbl">Descrição</label>
          <input className="fl-inp" placeholder="Ex: Bônus março" value={label} onChange={e => setLabel(e.target.value)} />
        </div>

        <label className="fl-lbl">Quem aporta?</label>
        <div className="own">
          <div className={`own-b ${owner === 'G' ? 'sg' : ''}`} onClick={() => setOwner('G')}>
            <div className="av av-g" style={{ width: 26, height: 26, fontSize: 11, flexShrink: 0 }}>G</div>
            <div className="own-n">Gabriel</div>
          </div>
          <div className={`own-b ${owner === 'A' ? 'sa' : ''}`} onClick={() => setOwner('A')}>
            <div className="av av-a" style={{ width: 26, height: 26, fontSize: 11, flexShrink: 0 }}>G</div>
            <div className="own-n">Gabi</div>
          </div>
        </div>

        <div className="inv-notice">💡 O aporte será registrado como saída nos lançamentos.</div>
        <button className="btn-p green" style={{ marginTop: 12 }} onClick={save} disabled={!amount}>
          Confirmar Aporte ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── EmergencyModal ──────────────────────────────────────────
export function EmergencyModal({ onClose }) {
  const { emergency, setEmergency } = useFinance()
  const [current, setCurrent] = useState(String(emergency.current))
  const [target,  setTarget]  = useState(String(emergency.target))
  const bump = (set, d) => set(v => String(Math.max(0, (parseInt(v) || 0) + d)))
  const pct = parseInt(target) > 0 ? Math.min(100, Math.round((parseInt(current) || 0) / (parseInt(target) || 1) * 100)) : 0

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">Reserva de Emergência</div>
        <div className="sh-s">🛡 Sua rede de segurança financeira.</div>
        <div style={{ background: 'linear-gradient(135deg,#0b1810,#091510)', border: '1px solid #1a3322', borderRadius: 16, padding: 14, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 30, fontWeight: 700, letterSpacing: -1, marginBottom: 4 }}>{fmt(parseInt(current) || 0)}</div>
          <div style={{ fontSize: 10, color: 'rgba(74,222,128,.5)', marginBottom: 10 }}>de {fmt(parseInt(target) || 0)} · {pct}%</div>
          <div style={{ height: 8, background: '#0f2218', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', borderRadius: 100, background: 'linear-gradient(90deg,#22c55e,#4ade80)', transition: 'width .5s' }} />
          </div>
        </div>
        <label className="fl-lbl">Guardado (R$)</label>
        <div className="step-row" style={{ marginBottom: 12 }}>
          <button className="step-btn" onClick={() => bump(setCurrent, -500)}>−</button>
          <div className="amtw step-inp" style={{ margin: 0, padding: '10px 14px' }}>
            <div className="cur" style={{ fontSize: 16 }}>R$</div>
            <input className="ain" style={{ fontSize: 22 }} type="number" inputMode="decimal" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <button className="step-btn" onClick={() => bump(setCurrent, 500)}>＋</button>
        </div>
        <label className="fl-lbl">Meta (R$)</label>
        <div className="step-row" style={{ marginBottom: 12 }}>
          <button className="step-btn" onClick={() => bump(setTarget, -1000)}>−</button>
          <div className="amtw step-inp" style={{ margin: 0, padding: '10px 14px' }}>
            <div className="cur" style={{ fontSize: 16 }}>R$</div>
            <input className="ain" style={{ fontSize: 22 }} type="number" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <button className="step-btn" onClick={() => bump(setTarget, 1000)}>＋</button>
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
          {[10000, 15000, 20000, 30000, 50000].map(v => (
            <button key={v} onClick={() => setTarget(String(v))}
              style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${parseInt(target) === v ? 'var(--green)' : 'var(--border)'}`, background: parseInt(target) === v ? 'var(--green-d)' : 'var(--s2)', color: parseInt(target) === v ? 'var(--green)' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {fmt(v)}
            </button>
          ))}
        </div>
        <button className="btn-p green" onClick={() => { setEmergency({ current: parseInt(current) || 0, target: parseInt(target) || 0 }); onClose() }}>
          Salvar ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── FreeLimitModal ──────────────────────────────────────────
// Unified pool (single limit for both persons)
export function FreeLimitModal({ onClose }) {
  const { free, setFree } = useFinance()
  const [limit, setLimit] = useState(String(free.limit))
  const bump = (d) => setLimit(v => String(Math.max(0, (parseInt(v) || 0) + d)))

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">Limite de Gasto Livre</div>
        <div className="sh-s">🎮 Lazer do casal — pool compartilhado.</div>
        <label className="fl-lbl">Limite mensal total (R$)</label>
        <div className="step-row">
          <button className="step-btn" onClick={() => bump(-100)}>−</button>
          <div className="amtw step-inp" style={{ margin: 0, padding: '10px 14px' }}>
            <div className="cur" style={{ fontSize: 16 }}>R$</div>
            <input className="ain" style={{ fontSize: 22 }} type="number" inputMode="decimal"
              value={limit} onChange={e => setLimit(e.target.value)} />
          </div>
          <button className="step-btn" onClick={() => bump(100)}>＋</button>
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
          {[500, 800, 1000, 1500, 2000].map(v => (
            <button key={v} onClick={() => setLimit(String(v))}
              style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${parseInt(limit) === v ? 'var(--amber)' : 'var(--border)'}`, background: parseInt(limit) === v ? 'var(--amber-d)' : 'var(--s2)', color: parseInt(limit) === v ? 'var(--amber)' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {fmt(v)}
            </button>
          ))}
        </div>
        <div style={{ background: 'var(--blue-d)', border: '1px solid var(--blue)', borderRadius: 10, padding: '9px 12px', marginBottom: 14, fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>
          💡 O pool é compartilhado. Gabriel e Gabi juntos têm {fmt(parseInt(limit) || 0)} para lazer.
        </div>
        <button className="btn-p" onClick={() => { setFree({ limit: parseInt(limit) || 0 }); onClose() }}>
          Salvar ✓
        </button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── ModoRealidadeModal ──────────────────────────────────────
export function ModoRealidadeModal({ saldoApp, onClose }) {
  const { reconcile } = useFinance()
  const [bancoVal, setBancoVal] = useState('')
  const banco = parseFloat(bancoVal.replace(',', '.')) || 0
  const diff  = banco - saldoApp
  const absDiff = Math.abs(diff)

  function apply() {
    if (!bancoVal) return
    reconcile(diff)
    onClose()
  }

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">⚖️ Modo Realidade</div>
        <div className="sh-s">Reconcilie o app com o seu banco.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>App diz</div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: saldoApp < 0 ? 'var(--coral)' : 'var(--text)', letterSpacing: -1 }}>{fmt(saldoApp)}</div>
          </div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>Banco tem</div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--amber)', letterSpacing: -1 }}>{bancoVal ? fmt(banco) : '?'}</div>
          </div>
        </div>

        <label className="fl-lbl">Saldo real no banco (R$)</label>
        <div className="amtw" style={{ marginBottom: 12 }}>
          <div className="cur">R$</div>
          <input className="ain" placeholder="0" type="number" inputMode="decimal"
            autoFocus value={bancoVal} onChange={e => setBancoVal(e.target.value)} />
        </div>

        {bancoVal && (
          <div style={{
            background: diff === 0 ? 'var(--green-d)' : diff > 0 ? 'var(--blue-d)' : 'var(--coral-d)',
            border: `1px solid ${diff === 0 ? 'var(--green)' : diff > 0 ? 'var(--blue)' : 'var(--coral)'}`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 14, textAlign: 'center',
          }}>
            {diff === 0 ? (
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>✅ Tudo certo! App e banco batem.</div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: diff > 0 ? 'var(--blue)' : 'var(--coral)', fontWeight: 700, marginBottom: 4 }}>
                  {diff > 0 ? `📈 Banco tem ${fmt(absDiff)} a mais. Faltou lançar algo.` : `📉 Banco tem ${fmt(absDiff)} a menos. Algum lançamento a mais.`}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  Criar lançamento de ajuste de {diff > 0 ? '+' : '−'}{fmt(absDiff)}?
                </div>
              </>
            )}
          </div>
        )}

        <button className="btn-p" onClick={apply} disabled={!bancoVal || diff === 0}>
          {diff === 0 ? '✅ Tudo Certo!' : `Ajustar ${diff > 0 ? '+' : '−'}${fmt(absDiff)}`}
        </button>
        <button className="btn-s" onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}

// ─── SimModal ────────────────────────────────────────────────
export function SimModal({ onClose }) {
  const { goals } = useFinance()
  const [val, setVal] = useState(200)
  const g = goals[0] || { name: 'Meta', emoji: '🎯', target: 15000, current: 4200, monthly: 1100 }
  const base  = g.monthly > 0 ? ((g.target - g.current) / g.monthly).toFixed(1) : '—'
  const saved = g.monthly > 0 ? (val * 0.8 / g.monthly).toFixed(1) : '0'
  const novo  = g.monthly > 0 ? Math.max(0, parseFloat(base) - parseFloat(saved)).toFixed(1) : '—'

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">Modo "E Se?" 🧮</div>
        <div className="sh-s">Veja o impacto de reduzir um hábito.</div>
        <div className="sim-b">
          <div className="sim-bl">Reduzindo o iFood em...</div>
          <div className="sim-v">− {fmt(val)}/mês</div>
          <input className="sim-sl" type="range" min="50" max="500" step="50"
            value={val} onChange={e => setVal(+e.target.value)} />
          <div className="sim-rl"><span>R$50</span><span>R$500</span></div>
        </div>
        <div className="sim-res">
          <div className="sim-lbl">{g.emoji} {g.name} antecipada em</div>
          <div className="sim-val">{saved} meses</div>
          <div className="sim-sub">Meta em <strong>{novo} meses</strong> em vez de {base}</div>
        </div>
        <button className="btn-p" onClick={onClose}>Entendi o impacto 👍</button>
      </div>
    </div>
  )
}

// ─── CelebrationModal ────────────────────────────────────────
export function CelebrationModal({ celebration }) {
  if (!celebration) return null
  return (
    <div className="conf" style={{ pointerEvents: 'none' }}>
      <div className="conf-i">{celebration.emoji}</div>
      <div className="conf-m">{celebration.message}</div>
    </div>
  )
}

// ─── GoalFormModal ───────────────────────────────────────────
export function GoalFormModal({ goal, onClose }) {
  const { addGoal, updateGoal } = useFinance()
  const { META_EMOJIS } = { META_EMOJIS: ['✈️','🚗','🏠','🎓','💻','🎮','🌍','🏖️','💍','🐾','🎸','📱','🏋️','🍕','🎁','💎','🚀','🌱','🛳️','🎭','🏡','⭐','🌺','🎯'] }
  const editing = !!goal
  const [name,  setName]  = useState(goal?.name  || '')
  const [emoji, setEmoji] = useState(goal?.emoji || '✈️')
  const [target,setTarget]= useState(goal?.target  ? String(goal.target)  : '')
  const [curr,  setCurr]  = useState(goal?.current ? String(goal.current) : '')
  const [dead,  setDead]  = useState(goal?.deadline || '')
  const [mo,    setMo]    = useState(goal?.monthly  ? String(goal.monthly) : '')

  function save() {
    const t = parseFloat(target) || 0
    if (!name || !t) return
    const payload = {
      id:           goal?.id || Date.now(),
      name, emoji,
      target:       t,
      current:      parseFloat(curr)  || 0,
      monthly:      parseFloat(mo)    || 0,
      deadline:     dead,
      parcelaGfIds: goal?.parcelaGfIds || [],
      contribs:     goal?.contribs    || [],
    }
    if (editing) updateGoal(payload)
    else addGoal(payload)
    onClose()
  }

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd" />
        <div className="sh-t">{editing ? 'Editar Meta' : 'Nova Meta'}</div>
        <div className="sh-s">Defina seu próximo objetivo.</div>

        <label className="fl-lbl">Ícone</label>
        <div className="emo-g">
          {META_EMOJIS.map(e => (
            <div key={e} className={`emo-b ${emoji === e ? 'sel' : ''}`} onClick={() => setEmoji(e)}>{e}</div>
          ))}
        </div>

        <div className="fl2">
          <label className="fl-lbl">Nome</label>
          <input className="fl-inp" placeholder="Ex: Viagem Europa" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
          <div>
            <label className="fl-lbl">Total (R$)</label>
            <input className="fl-inp" placeholder="15000" type="number" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <div>
            <label className="fl-lbl">Já guardado (R$)</label>
            <input className="fl-inp" placeholder="0" type="number" inputMode="decimal" value={curr} onChange={e => setCurr(e.target.value)} />
          </div>
          <div>
            <label className="fl-lbl">Aporte/mês (R$)</label>
            <input className="fl-inp" placeholder="500" type="number" inputMode="decimal" value={mo} onChange={e => setMo(e.target.value)} />
          </div>
          <div>
            <label className="fl-lbl">Prazo</label>
            <input className="fl-inp" placeholder="Dez 2025" value={dead} onChange={e => setDead(e.target.value)} />
          </div>
        </div>

        <button className="btn-p" onClick={save} disabled={!name || !target}>Salvar Meta ✓</button>
        <button className="btn-s" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
