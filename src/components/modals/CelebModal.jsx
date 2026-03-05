import { useState } from 'react'
import { REACTIONS } from '../../constants.js'

export default function CelebModal({ notif, onClose, onSend }) {
  const [picked, setPicked] = useState(null)

  function send() {
    onSend(notif.id, picked || '🎉')
    onClose()
  }

  const names = { Gabriel: 'Gabi', Gabi: 'Gabriel' }
  const receiver = names[notif.from] || 'parceiro(a)'

  return (
    <div className="ov" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sh-hd"/>
        <div style={{textAlign:'center',padding:'0 4px 14px'}}>
          <div style={{fontSize:52,marginBottom:8}}>{notif.goalEmoji}</div>
          <div style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:700,color:'var(--amber)',marginBottom:4}}>
            {notif.milestone}% concluído!
          </div>
          <div style={{fontSize:13,color:'var(--text)',marginBottom:4}}>
            {notif.goalName}
          </div>
          <div style={{fontSize:11.5,color:'var(--muted)',lineHeight:1.5}}>
            {notif.from} atingiu um marco importante.<br/>
            Envie uma reação para {receiver}!
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:18}}>
          {REACTIONS.map(r => (
            <div key={r}
              onClick={() => setPicked(r)}
              style={{
                height:46, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, cursor:'pointer', transition:'.18s',
                border:`2px solid ${picked===r?'var(--amber)':'var(--border)'}`,
                background:picked===r?'var(--amber-d)':'var(--s2)',
              }}>
              {r}
            </div>
          ))}
        </div>

        <button className="btn-p" onClick={send}>
          Enviar {picked||'🎉'} para {receiver}!
        </button>
        <button className="btn-s" onClick={onClose}>Agora não</button>
      </div>
    </div>
  )
}
