export default function ScoreRing({ score }) {
  const r = 20, c = 2 * Math.PI * r
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B+' : score >= 50 ? 'B' : 'C'
  const cls   = score >= 80 ? 'b-good' : score >= 50 ? 'b-warn' : 'b-bad'
  return {
    ring: (
      <div className="rw">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r={r} fill="none" stroke="#2a221c" strokeWidth="5"/>
          <circle cx="25" cy="25" r={r} fill="none" stroke="#f5a623" strokeWidth="5"
            strokeDasharray={`${(score/100)*c} ${c}`} strokeLinecap="round"
            style={{ transform:'rotate(-90deg)', transformOrigin:'25px 25px' }}/>
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
