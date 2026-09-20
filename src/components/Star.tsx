type StarProps = {
  emoji?: string;
  accent?: string;
  size?: number;
  spin?: boolean;
  className?: string;
};

/**
 * The star8 "postage stamp" emblem used by the darija party games.
 * A spinning starburst + mascot emoji on a paper tile.
 */
export default function Star({
  emoji,
  accent = '#F2B23D',
  size = 88,
  spin = false,
  className = '',
}: StarProps) {
  return (
    <div
      className={`pointer-events-none relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 h-full w-full ${spin ? 'star-spin' : ''}`}
        style={{ filter: 'drop-shadow(2px 2px 0 rgba(42,33,24,.25))' }}
      >
        <g fill="none" stroke={accent} strokeWidth="5">
          <path d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z" />
        </g>
        <g fill="none" stroke="#2A2118" strokeWidth="1.6" opacity="0.5" transform="translate(0 5)">
          <path d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z" />
        </g>
      </svg>
      {emoji && (
        <span
          className="relative z-10 leading-none"
          style={{ fontSize: size * 0.46, transform: 'rotate(-3deg)' }}
        >
          {emoji}
        </span>
      )}
    </div>
  );
}

/** Compact bar-mark used in the header / auth cards. */
export function StarMark({ size = 34, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`pointer-events-none relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="star-spin absolute inset-0 h-full w-full">
        <g fill="none" stroke="#F2B23D" strokeWidth="8" opacity="0.9">
          <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" />
        </g>
      </svg>
      <span className="relative z-10 leading-none" style={{ fontSize: size * 0.34 }}>
        🎲
      </span>
    </div>
  );
}