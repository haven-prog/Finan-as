import { useState } from 'react'
import { useFinance, SYNC_STATUS } from '../../context/FinanceContext.jsx'

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function SyncSetup({ onConnect, onSkip }) {
  const { syncInfo, syncStatus, lastSynced, disconnectRoom } = useFinance()
  const [step,    setStep]   = useState('choice')
  const [name,    setName]   = useState('')
  const [code,    setCode]   = useState('')
  const [newCode, setNewCode] = useState(() => genCode())
  const [error,   setError]  = useState('')
  const [loading, setLoading] = useState(false)

  const timeStr = lastSynced
    ? lastSynced.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    : null

  const statusLabel = {
    [SYNC_STATUS.SYNCED]:  '✅ Sincronizado',
    [SYNC_STATUS.SYNCING]: '🔄 Sincronizando...',
    [SYNC_STATUS.ERROR]:   '⚠️ Erro',
    [SYNC_STATUS.OFFLINE]: '📴 Offline',
  }[syncStatus] || '...'

  // ── JÁ CONECTADO ─────────────────────────────────────────
  if (syncInfo) return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🔗</div>
          <div className="sh-title" style={{ color:'var(--grn)' }}>Casal conectado!</div>
          <div className="sh-sub">Logado como <strong style={{ color:'var(--txt)' }}>{syncInfo.userName}</strong></div>
        </div>

        <div style={{ background:'var(--grn-a)', border:'1px solid rgba(62,207,114,.18)', borderRadius:'var(--r-l)', padding:18, marginBottom:14, textAlign:'center' }}>
          <div className="lbl" style={{ color:'rgba(62,207,114,.5)', marginBottom:8 }}>CÓDIGO DA SALA</div>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:38, letterSpacing:8, color:'var(--grn)', marginBottom:6 }}>
            {syncInfo.roomCode}
          </div>
          <div style={{ fontSize:12, color:'var(--sub)' }}>
            {statusLabel}{timeStr ? ` · ${timeStr}` : ''}
          </div>
        </div>

        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:'var(--sub)', lineHeight:1.7 }}>
            📱 Para a Gabi conectar:<br/>
            <strong style={{ color:'var(--txt)' }}>Abra o app → 🔗 Conectar → Entrar → digita <span style={{ color:'var(--grn)' }}>{syncInfo.roomCode}</span></strong>
          </div>
        </div>

        <button className="btn-p" onClick={onSkip}>Fechar ✓</button>
        <button className="btn-s btn-danger" onClick={() => { disconnectRoom(); onSkip() }}>
          Desconectar da sala
        </button>
      </div>
    </div>
  )

  // ── ESCOLHA ───────────────────────────────────────────────
  if (step === 'choice') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🔗</div>
          <div className="sh-title">Sync em Tempo Real</div>
          <div className="sh-sub">Tudo que você lança aparece no celular da Gabi em segundos.</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div onClick={() => setStep('create')} style={{ padding:'18px 14px', borderRadius:'var(--r-l)', border:'1.5px solid var(--gold)', background:'var(--gold-a)', cursor:'pointer', textAlign:'center' }}>
            <div style={{ fontSize:30, marginBottom:8 }}>✨</div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--gold)', marginBottom:4 }}>Criar sala</div>
            <div style={{ fontSize:11, color:'var(--sub)', lineHeight:1.5 }}>Gere o código e passe pra Gabi</div>
          </div>
          <div onClick={() => setStep('join')} style={{ padding:'18px 14px', borderRadius:'var(--r-l)', border:'1.5px solid var(--grn)', background:'var(--grn-a)', cursor:'pointer', textAlign:'center' }}>
            <div style={{ fontSize:30, marginBottom:8 }}>🔑</div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--grn)', marginBottom:4 }}>Entrar</div>
            <div style={{ fontSize:11, color:'var(--sub)', lineHeight:1.5 }}>Você já tem o código</div>
          </div>
        </div>

        <button className="btn-s" onClick={onSkip}>Agora não</button>
      </div>
    </div>
  )

  // ── CRIAR ─────────────────────────────────────────────────
  if (step === 'create') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Criar Sala</div>
        <div className="sh-sub">Informe seu nome — um código único será gerado.</div>

        <div className="fl2">
          <label className="fl-lbl">Seu nome</label>
          <input className="fl-inp" placeholder="Ex: Gabriel" value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            autoFocus/>
        </div>
        {error && <div style={{ fontSize:11, color:'var(--red)', marginBottom:8 }}>{error}</div>}

        <button className="btn-p" onClick={() => {
          if (!name.trim()) { setError('Digite seu nome'); return }
          setStep('created')
        }}>Gerar código ✓</button>
        <button className="btn-s" onClick={() => setStep('choice')}>Voltar</button>
      </div>
    </div>
  )

  // ── CÓDIGO GERADO ─────────────────────────────────────────
  if (step === 'created') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🎉</div>
          <div className="sh-title">Sala criada!</div>
          <div style={{ fontSize:12, color:'var(--sub)', marginBottom:18 }}>Manda este código pra Gabi:</div>
          <div style={{
            fontFamily:'Instrument Serif,serif', fontSize:40, fontWeight:700, letterSpacing:8,
            color:'var(--gold)', background:'var(--gold-a)',
            border:'2px solid var(--gold)', borderRadius:'var(--r-l)',
            padding:'18px 24px', marginBottom:12, userSelect:'all',
          }}>
            {newCode}
          </div>
          <div style={{ fontSize:11, color:'var(--sub)', lineHeight:1.6 }}>
            No celular dela: 🔗 → "Entrar" → digita o código acima
          </div>
        </div>

        <button className="btn-p" onClick={() => onConnect(newCode, name.trim())}>
          Conectar com este código ✓
        </button>
        <button className="btn-s" onClick={() => setNewCode(genCode())}>
          🔄 Gerar outro código
        </button>
      </div>
    </div>
  )

  // ── ENTRAR ────────────────────────────────────────────────
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-title">Entrar na Sala</div>
        <div className="sh-sub">Digite o código que Gabriel gerou.</div>

        <div className="fl2">
          <label className="fl-lbl">Seu nome</label>
          <input className="fl-inp" placeholder="Ex: Gabi" value={name}
            onChange={e => { setName(e.target.value); setError('') }}/>
        </div>
        <div className="fl2">
          <label className="fl-lbl">Código da sala (6 letras)</label>
          <input className="fl-inp" placeholder="ABC123"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            style={{ letterSpacing:6, fontSize:24, fontFamily:'Instrument Serif,serif', textAlign:'center' }}
            maxLength={6} autoCapitalize="characters"/>
        </div>
        {error && <div style={{ fontSize:11, color:'var(--red)', marginBottom:8 }}>{error}</div>}

        <button className="btn-p" disabled={loading} onClick={() => {
          if (!name.trim()) { setError('Digite seu nome'); return }
          if (code.trim().length < 6) { setError('Código precisa ter 6 caracteres'); return }
          setLoading(true)
          setTimeout(() => { setLoading(false); onConnect(code.trim(), name.trim()) }, 600)
        }}>
          {loading ? 'Conectando...' : 'Entrar na sala ✓'}
        </button>
        <button className="btn-s" onClick={() => setStep('choice')}>Voltar</button>
      </div>
    </div>
  )
}
