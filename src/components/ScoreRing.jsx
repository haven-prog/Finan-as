// ─── ScoreRing ────────────────────────────────────────────────
export default function ScoreRing({ score, size = 50 }) {
  const r = size * 0.4
  const c = 2 * Math.PI * r
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B+' : score >= 50 ? 'B' : 'C'
  const cls   = score >= 80 ? 'b-good' : score >= 50 ? 'b-warn' : 'b-bad'

  return {
    ring: (
      <div className="rw" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#2a221c" strokeWidth="5"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#f5a623" strokeWidth="5"
            strokeDasharray={`${(score / 100) * c} ${c}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="rc">
          <div className="rn">{score}</div>
          <div className="rs">pts</div>
        </div>
      </div>
    ),
    grade,
    cls,
  }
}
