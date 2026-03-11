export default function ScoreRing({ score }) {
  const r = 20, c = 2 * Math.PI * r
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B+' : score >= 50 ? 'B' : 'C'
  const cls   = score >= 80 ? 'b-good' : score >= 50 ? 'b-warn' : 'b-bad'
  const color = score >= 80 ? '#48c97a' : score >= 50 ? '#f0a500' : '#f06060'
  return {
    ring: (
      <div className="rw">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="#252018" strokeWidth="5"/>
          <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(score/100)*c} ${c}`} strokeLinecap="round"
            style={{ transform:'rotate(-90deg)', transformOrigin:'26px 26px' }}/>
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
