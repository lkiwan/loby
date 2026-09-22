import type { ReactNode } from 'react'

/**
 * Top-down view of the worn wooden table. Cards are laid on an ellipse
 * via absolute positioning computed by `ellipsePos`.
 */
export function GameTable({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`wood-frame relative w-full ${className}`}>
      <div
        className="wood-table relative w-full aspect-[1/1.08] rounded-[46%] overflow-hidden"
        style={{
          backgroundImage: 'url(/img/table-bg.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* warm lantern glow in the middle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[46%]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(234,179,8,.10) 0%, rgba(0,0,0,0) 46%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 78%)',
          }}
        />
        {children}
      </div>
    </div>
  )
}