const NAV = [
  { id:'home',   ico:'🏠', lbl:'Início'  },
  { id:'fixos',  ico:'📌', lbl:'Fixos'   },
  { id:'metas',  ico:'🎯', lbl:'Metas'   },
  { id:'gastos', ico:'📋', lbl:'Gastos'  },
  { id:'intel',  ico:'🧠', lbl:'IA'      },
]
export default function BottomNav({ tab, onTab, unreadCount }) {
  return (
    <nav className="bnav">
      {NAV.map(n => (
        <div key={n.id} className={`ni${tab===n.id?' active':''}`} onClick={() => onTab(n.id)}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <span className="ni-i">{n.ico}</span>
            {n.id === 'home' && unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </div>
          <div className="ni-l">{n.lbl}</div>
        </div>
      ))}
    </nav>
  )
}
