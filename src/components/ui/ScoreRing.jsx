export default function ScoreRing({ score }) {
  const r = 20, c = 2 * Math.PI * r
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B+' : score >= 50 ? 'B' : 'C'
  const cls   = score >= 80 ? 'badge-grn' : score >= 50 ? 'badge-gold' : 'badge-red'
  const color = score >= 80 ? '#3ecf72'   : score >= 50 ? '#f0a500'    : '#f56060'
  return {
    ring: (
      <div className="rw">
        <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="25" cy="25" r={r} fill="none" stroke="#262119" strokeWidth="5"/>
          <circle cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(score/100)*c} ${c}`} strokeLinecap="round"/>
        </svg>
        <div className="rc">
          <div className="rn">{score}</div>
          <div className="rs">pts</div>
        </div>
      </div>
    ),
    grade, cls,
  }
}
