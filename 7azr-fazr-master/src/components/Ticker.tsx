const ITEMS = [
  '🔍 حزر فزر',
  '7ZER FZER',
  '🕵️ جاسوس ولا جاسوسين',
  'دوزو التاب برك',
  '🤫 حركة سرية',
  '👂 استجواب بالدارجة',
  '⏱️ الوقت يدور',
  '🔍 حزر فزر',
  '7ZER FZER',
  '🕵️ جاسوس ولا جاسوسين',
  'دوزو التاب برك',
  '🤫 حركة سرية',
  '👂 استجواب بالدارجة',
  '⏱️ الوقت يدور',
]

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden>
      <div className="track">
        {ITEMS.map((t, i) => (
          <span key={i}>
            {t} <span style={{ opacity: 0.4 }}>•</span>{' '}
          </span>
        ))}
      </div>
    </div>
  )
}