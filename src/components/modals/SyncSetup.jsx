import { useState } from 'react'
import { useFinance, SYNC_STATUS } from '../../context/FinanceContext.jsx'

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function SyncSetup({ onConnect, onSkip }) {
  const { syncInfo, syncStatus, lastSynced, disconnectRoom } = useFinance()
  const [step,    setStep]   = useState(syncInfo ? 'connected' : 'choice')
  const [name,    setName]   = useState('')
  const [code,    setCode]   = useState('')
  const [newCode, setNewCode] = useState('')
  const [error,   setError]  = useState('')
  const [loading, setLoading] = useState(false)

  // ── Already connected ──────────────────────────────────────
  if (step === 'connected' || syncInfo) {
    const timeStr = lastSynced
      ? lastSynced.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : null

    const statusLabel = {
      [SYNC_STATUS.SYNCED]:  '✅ Sincronizado',
      [SYNC_STATUS.SYNCING]: '🔄 Sincronizando...',
      [SYNC_STATUS.ERROR]:   '⚠️ Erro de conexão',
      [SYNC_STATUS.OFFLINE]: '📴 Offline',
    }[syncStatus] || '...'

    return (
      <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
        <div className="sheet">
          <div className="sh-hd"/>
          <div style={{ textAlign: 'center', padding: '10px 4px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>
              Casal conectado!
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Logado como <strong style={{ color: 'var(--text)' }}>{syncInfo.userName}</strong>
            </div>
          </div>

          {/* Sala info */}
          <div style={{ background: 'var(--green-d)', border: '1px solid var(--green)', borderRadius: 16, padding: '16px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              Código da sala
            </div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 36, fontWeight: 700, letterSpacing: 8, color: 'var(--green)' }}>
              {syncInfo.roomCode}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {statusLabel}{timeStr ? ` · ${timeStr}` : ''}
            </div>
          </div>

          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>
              📱 Para Gabi conectar no celular dela:<br/>
              Abra o app → toque em <strong style={{ color: 'var(--amber)' }}>🔗 Conectar</strong> → "Entrar" → digita <strong style={{ color: 'var(--green)' }}>{syncInfo.roomCode}</strong>
            </div>
          </div>

          <button className="btn-p" onClick={onSkip}>Fechar ✓</button>
          <button className="btn-s" onClick={() => { disconnectRoom(); onSkip() }}
            style={{ color: 'var(--coral)', borderColor: 'var(--coral-d)' }}>
            Desconectar da sala
          </button>
        </div>
      </div>
    )
  }

  // ── Choice ────────────────────────────────────────────────
  if (step === 'choice') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{ textAlign: 'center', padding: '10px 4px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 22, fontWeight: 700, color: 'var(--amber)', marginBottom: 8 }}>
            Sync em Tempo Real
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Tudo que você lança aparece no celular da Gabi em segundos — e vice-versa.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div onClick={() => setStep('create')}
            style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid var(--amber)',
              background: 'var(--amber-d)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>Criar sala</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.5 }}>Você cria e passa o código pra Gabi</div>
          </div>
          <div onClick={() => setStep('join')}
            style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid var(--green)',
              background: 'var(--green-d)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔑</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>Entrar</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.5 }}>Você já tem o código do Gabriel</div>
          </div>
        </div>

        <button className="btn-s" onClick={onSkip}>Agora não</button>
      </div>
    </div>
  )

  // ── Create ────────────────────────────────────────────────
  if (step === 'create') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">Criar Sala</div>
        <div className="sh-s">Um código único será gerado para o casal.</div>

        <div className="fl2">
          <label className="fl-lbl">Seu nome</label>
          <input className="fl-inp" placeholder="Ex: Gabriel" value={name}
            onChange={e => { setName(e.target.value); setError('') }}/>
        </div>
        {error && <div style={{ fontSize: 11, color: 'var(--coral)', marginBottom: 8 }}>{error}</div>}

        <button className="btn-p" onClick={() => {
          if (!name.trim()) { setError('Digite seu nome'); return }
          setNewCode(genCode())
          setStep('created')
        }}>Gerar código ✓</button>
        <button className="btn-s" onClick={() => setStep('choice')}>Voltar</button>
      </div>
    </div>
  )

  // ── Created ───────────────────────────────────────────────
  if (step === 'created') return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{ textAlign: 'center', padding: '8px 4px 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Sala criada!
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Manda este código pra Gabi:
          </div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 40, fontWeight: 700, letterSpacing: 8,
            color: 'var(--amber)', background: 'var(--amber-d)', borderRadius: 16, padding: '16px 20px',
            border: '2px solid var(--amber)', marginBottom: 14, userSelect: 'all' }}>
            {newCode}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
            No celular dela: toque em 🔗 → "Entrar" → digita o código acima
          </div>
        </div>
        <button className="btn-p" onClick={() => onConnect(newCode, name.trim())}>
          Conectar com este código ✓
        </button>
        <button className="btn-s" onClick={() => { setNewCode(genCode()) }}>
          Gerar outro código
        </button>
      </div>
    </div>
  )

  // ── Join ──────────────────────────────────────────────────
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div className="sh-t">Entrar na Sala</div>
        <div className="sh-s">Digite o código que Gabriel gerou.</div>

        <div className="fl2">
          <label className="fl-lbl">Seu nome</label>
          <input className="fl-inp" placeholder="Ex: Gabi" value={name}
            onChange={e => { setName(e.target.value); setError('') }}/>
        </div>
        <div className="fl2">
          <label className="fl-lbl">Código da sala</label>
          <input className="fl-inp" placeholder="ABC123" value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            style={{ letterSpacing: 5, fontSize: 22, fontFamily: 'Fraunces,serif', textAlign: 'center' }}
            maxLength={6}/>
        </div>
        {error && <div style={{ fontSize: 11, color: 'var(--coral)', marginBottom: 8 }}>{error}</div>}

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
