export default function Confirm({ title, msg, onYes, onNo }) {
  return (
    <div className="ov-c" onClick={e => e.target === e.currentTarget && onNo()}>
      <div className="sc-box">
        <div style={{ fontSize: 38, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>{msg}</div>
        <button className="btn-s btn-danger" onClick={onYes}>Sim, excluir</button>
        <button className="btn-s" onClick={onNo}>Cancelar</button>
      </div>
    </div>
  )
}
