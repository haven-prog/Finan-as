const NAV = [
  { id: 'home',  ico: '🏠', lbl: 'Início' },
  { id: 'fixos', ico: '📌', lbl: 'Fixos' },
  { id: 'metas', ico: '🎯', lbl: 'Metas' },
  { id: 'gastos',ico: '📋', lbl: 'Gastos' },
  { id: 'intel', ico: '🧠', lbl: 'IA' },
]

export default function BottomNav({ tab, onTab, unreadCount }) {
  return (
    <nav className="bnav">
      {NAV.map(n => (
        <div key={n.id} className={`ni ${tab === n.id ? 'active' : ''}`} onClick={() => onTab(n.id)}>
          <div className="ni-i" style={{ position: 'relative', display: 'inline-block' }}>
            {n.ico}
            {n.id === 'home' && unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -6,
                background: 'var(--coral)', color: '#fff',
                fontSize: 8, fontWeight: 800, borderRadius: 20,
                padding: '1px 4px', lineHeight: 1.4,
              }}>{unreadCount}</span>
            )}
          </div>
          <div className="ni-l">{n.lbl}</div>
        </div>
      ))}
    </nav>
  )
}
