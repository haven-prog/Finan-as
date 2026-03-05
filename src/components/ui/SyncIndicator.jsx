import { useFinance } from '../../context/FinanceContext.jsx'
import { SYNC_STATUS } from '../../context/FinanceContext.jsx'

const STATUS_CONFIG = {
  [SYNC_STATUS.OFFLINE]:   { icon:'📴', color:'var(--muted)', label:'Offline' },
  [SYNC_STATUS.SYNCING]:   { icon:'🔄', color:'var(--amber)', label:'Sincronizando...' },
  [SYNC_STATUS.SYNCED]:    { icon:'✅', color:'var(--green)', label:'Sincronizado' },
  [SYNC_STATUS.ERROR]:     { icon:'⚠️', color:'var(--coral)', label:'Erro de sync' },
  [SYNC_STATUS.NO_CONFIG]: { icon:'🔗', color:'var(--blue)', label:'Conectar' },
}

export default function SyncIndicator({ onOpenSync }) {
  const { syncStatus, syncInfo, lastSynced } = useFinance()
  const cfg = STATUS_CONFIG[syncStatus] || STATUS_CONFIG[SYNC_STATUS.NO_CONFIG]

  const timeStr = lastSynced
    ? lastSynced.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    : null

  return (
    <button onClick={onOpenSync}
      style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
        borderRadius:20, border:`1px solid ${cfg.color}33`, background:`${cfg.color}11`,
        cursor:'pointer', transition:'.18s' }}>
      <span style={{ fontSize:13 }}>{cfg.icon}</span>
      <div style={{ textAlign:'left' }}>
        <div style={{ fontSize:10, fontWeight:700, color:cfg.color, lineHeight:1 }}>
          {syncInfo?.roomCode ? `Sala ${syncInfo.roomCode}` : cfg.label}
        </div>
        {syncInfo && timeStr && (
          <div style={{ fontSize:8.5, color:'var(--muted)', lineHeight:1, marginTop:1 }}>
            {cfg.label} {timeStr}
          </div>
        )}
      </div>
    </button>
  )
}
