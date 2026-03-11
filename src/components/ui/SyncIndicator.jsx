import { useFinance, SYNC_STATUS } from '../../context/FinanceContext.jsx'
const CFG = {
  [SYNC_STATUS.OFFLINE]:   { mark:'○', color:'var(--sub)'  },
  [SYNC_STATUS.SYNCING]:   { mark:'↻', color:'var(--gold)' },
  [SYNC_STATUS.SYNCED]:    { mark:'✓', color:'var(--grn)'  },
  [SYNC_STATUS.ERROR]:     { mark:'!', color:'var(--red)'  },
  [SYNC_STATUS.NO_CONFIG]: { mark:'⊕', color:'var(--blu)'  },
}
export default function SyncIndicator({ onOpenSync }) {
  const { syncStatus, syncInfo } = useFinance()
  const cfg = CFG[syncStatus] || CFG[SYNC_STATUS.NO_CONFIG]
  const label = syncInfo?.roomCode
    ? syncInfo.roomCode
    : syncStatus === SYNC_STATUS.NO_CONFIG ? 'Conectar' : ''
  return (
    <button onClick={onOpenSync} style={{
      display:'flex', alignItems:'center', gap:5,
      padding:'6px 12px', borderRadius:99,
      border:`1px solid ${cfg.color}2a`,
      background:`${cfg.color}0d`,
      cursor:'pointer',
    }}>
      <span style={{ fontSize:13, color:cfg.color, fontWeight:700, lineHeight:1 }}>{cfg.mark}</span>
      {label && <span style={{ fontSize:11, fontWeight:600, color:cfg.color }}>{label}</span>}
    </button>
  )
}
