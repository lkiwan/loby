import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface HoldRevealProps {
  onReveal?: () => void
  hint?: string
  veilIcon?: string
  children: ReactNode
}

export default function HoldReveal({ onReveal, hint = 'ضغط باش تكشف السر', veilIcon = '🃏', children }: HoldRevealProps) {
  const [live, setLive] = useState(false)

  useEffect(() => {
    setLive(false)
  }, [])

  function reveal() {
    if (live) return
    setLive(true)
    onReveal?.()
  }

  const cls = ['hold', 'tap-to-reveal']
  if (live) cls.push('live')

  return (
    <div className={cls.join(' ')} onClick={reveal} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && reveal()}>
      {!live && (
        <div className="veil">
          <div className="ring ring-pop">
            <div className="ring-inner">{veilIcon}</div>
          </div>
          <p className="hint">{hint}</p>
        </div>
      )}
      {live && <div className="secret">{children}</div>}
    </div>
  )
}