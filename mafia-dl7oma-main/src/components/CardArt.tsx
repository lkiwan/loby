import type { Role } from '../game/types'

/* Portrait artwork for every role (Omar's accepted designs, 2026-11-03). */

export function RoleArt({
  role,
  className = '',
  fit = 'contain',
}: {
  role: Role
  className?: string
  fit?: 'contain' | 'cover'
}) {
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain'
  switch (role) {
    case 'EISSABA':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-eissaba.png`}
          alt="عصابة"
          draggable={false}
          className={`select-none ${fitClass} ${className}`}
        />
      )
    case 'BOULIS':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-boulis.png`}
          alt="بوليس"
          draggable={false}
          className={`select-none ${fitClass} ${className}`}
        />
      )
    case 'TBIB':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-tbib.png`}
          alt="طبيب"
          draggable={false}
          className={`select-none ${fitClass} ${className}`}
        />
      )
    case 'WLAD_LHOUMA':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-wladlh.png`}
          alt="ولاد الحومة"
          draggable={false}
          className={`select-none ${fitClass} ${className}`}
        />
      )
  }
}

/* Card back — golden-skull artwork (Omar's accepted design, 2026-11-03). */
export function CardBackArt({ className = '' }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/card-back-skull.png`}
      alt="L'Mafia d'L'Houma"
      draggable={false}
      className={`select-none object-cover ${className}`}
    />
  )
}