import { useFinance, SYNC_STATUS } from '../../context/FinanceContext.jsx'

const CFG = {
  [SYNC_STATUS.OFFLINE]:   { icon:'○', color:'var(--sub)' },
  [SYNC_STATUS.SYNCING]:   { icon:'↻', color:'var(--amber)' },
  [SYNC_STATUS.SYNCED]:    { icon:'✓', color:'var(--green)' },
  [SYNC_STATUS.ERROR]:     { icon:'!', color:'var(--coral)' },
  [SYNC_STATUS.NO_CONFIG]: { icon:'⊕', color:'var(--blue)' },
}

export default function SyncIndicator({ onOpenSync }) {
  const { syncStatus, syncInfo } = useFinance()
  const cfg = CFG[syncStatus] || CFG[SYNC_STATUS.NO_CONFIG]
  const label = syncInfo?.roomCode ? syncInfo.roomCode : syncStatus === SYNC_STATUS.NO_CONFIG ? 'Conectar' : null

  return (
    <button onClick={onOpenSync} style={{
      display:'flex', alignItems:'center', gap:5, padding:'6px 11px',
      borderRadius:20, border:`1px solid ${cfg.color}33`, background:`${cfg.color}0d`,
      cursor:'pointer', transition:'.15s',
    }}>
      <span style={{ fontSize:14, color:cfg.color, fontWeight:700, lineHeight:1 }}>{cfg.icon}</span>
      {label && (
        <span style={{ fontSize:11, fontWeight:600, color:cfg.color }}>{label}</span>
      )}
    </button>
  )
}
