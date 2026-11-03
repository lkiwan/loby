import type { Role } from '../game/types'

/* Placeholder vector portraits for every role. */

export function RoleArt({ role, className = '' }: { role: Role; className?: string }) {
  switch (role) {
    case 'EISSABA':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-eissaba.png`}
          alt="عصابة"
          draggable={false}
          className={`select-none object-contain ${className}`}
        />
      )
    case 'BOULIS':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-boulis.png`}
          alt="بوليس"
          draggable={false}
          className={`select-none object-contain ${className}`}
        />
      )
    case 'TBIB':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-tbib.png`}
          alt="طبيب"
          draggable={false}
          className={`select-none object-contain ${className}`}
        />
      )
    case 'WLAD_LHOUMA':
      return (
        <img
          src={`${import.meta.env.BASE_URL}img/role-wladlh.png`}
          alt="ولاد الحومة"
          draggable={false}
          className={`select-none object-contain ${className}`}
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