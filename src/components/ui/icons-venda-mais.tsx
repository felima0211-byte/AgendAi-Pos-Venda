import React from 'react'

// ─── ÍCONES DE SEÇÃO (13px para labels) ───

export function IconAprendizado({ size = 24, color = '#6C4CF0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <circle cx="12" cy="8" r="1.5" fill={color}/>
      <path d="M12 11v3" strokeWidth="1.5"/>
    </svg>
  )
}

export function IconEstrategia({ size = 24, color = '#E07B1A' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2" fill={color}/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
  )
}

export function IconCasos({ size = 24, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
      <line x1="9" y1="5" x2="15" y2="5"/>
    </svg>
  )
}

export function IconDados({ size = 24, color = '#3B82F6' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  )
}

// ─── ÍCONES PARA CARDS (48px - Premium Design) ───

// Estudo 1: Documento com gráfico
export function IconEstudo1({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-estudo1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C4CF0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="28" height="36" rx="3" fill="url(#grad-estudo1)" opacity="0.15" stroke="url(#grad-estudo1)" strokeWidth="1.5"/>
      <path d="M14 14h20M14 22h20M14 30h14" stroke="#6C4CF0" strokeWidth="2" strokeLinecap="round"/>
      <rect x="14" y="18" width="4" height="8" fill="#6C4CF0" rx="1"/>
      <rect x="20" y="16" width="4" height="10" fill="#8B5CF6" rx="1"/>
      <rect x="26" y="14" width="4" height="12" fill="#6C4CF0" rx="1"/>
    </svg>
  )
}

// Estudo 2: Lâmpada (Insight)
export function IconEstudo2({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-estudo2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C4CF0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M24 8c5 0 9 4 9 9 0 3-1.5 5.5-3 7.5v8.5H18v-8.5c-1.5-2-3-4.5-3-7.5 0-5 4-9 9-9z" fill="url(#grad-estudo2)" opacity="0.2" stroke="url(#grad-estudo2)" strokeWidth="1.5"/>
      <path d="M20 36h8M22 38h4" stroke="#6C4CF0" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="15" r="2.5" fill="#6C4CF0"/>
    </svg>
  )
}

// Estudo 3: Livro aberto
export function IconEstudo3({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-estudo3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C4CF0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M24 8v32M10 12c0-2 1-4 3-4h14v32H13c-2 0-3-2-3-4v-24zM38 12c0-2-1-4-3-4H21v32h24c2 0 3-2 3-4v-24z" fill="url(#grad-estudo3)" opacity="0.2" stroke="url(#grad-estudo3)" strokeWidth="1.5"/>
      <path d="M14 16h8M14 22h8M14 28h8M34 16h-8M34 22h-8M34 28h-8" stroke="#6C4CF0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Estudo 4: Cérebro (Aprendizado)
export function IconEstudo4({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-estudo4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C4CF0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="14" r="4" fill="url(#grad-estudo4)" opacity="0.3" stroke="url(#grad-estudo4)" strokeWidth="1.5"/>
      <circle cx="24" cy="10" r="5" fill="url(#grad-estudo4)" opacity="0.4" stroke="url(#grad-estudo4)" strokeWidth="1.5"/>
      <circle cx="32" cy="14" r="4" fill="url(#grad-estudo4)" opacity="0.3" stroke="url(#grad-estudo4)" strokeWidth="1.5"/>
      <path d="M16 18c0 3-2 6-4 8M24 15c0 4-2 8-2 11M32 18c0 3 2 6 4 8" stroke="url(#grad-estudo4)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="36" r="3" fill="url(#grad-estudo4)"/>
    </svg>
  )
}

// Tática 1: Seta em alvo
export function IconTatica1({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-tatica1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07B1A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="12" fill="url(#grad-tatica1)" opacity="0.15" stroke="url(#grad-tatica1)" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="7" fill="none" stroke="url(#grad-tatica1)" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="3" fill="url(#grad-tatica1)"/>
      <path d="M24 8l3 4-1 6h8l-6 4 2 6-8-5-8 5 2-6-6-4h8l-1-6z" fill="url(#grad-tatica1)" opacity="0.4"/>
    </svg>
  )
}

// Tática 2: Conectar pontos (Network)
export function IconTatica2({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-tatica2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07B1A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="24" r="4" fill="url(#grad-tatica2)"/>
      <circle cx="24" cy="12" r="4" fill="url(#grad-tatica2)"/>
      <circle cx="36" cy="24" r="4" fill="url(#grad-tatica2)"/>
      <circle cx="24" cy="36" r="4" fill="url(#grad-tatica2)"/>
      <path d="M15 21l9-9M33 21l-9 9M27 15l-6 18M21 33l6-18" stroke="url(#grad-tatica2)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Tática 3: Aperto de mão (Conexão)
export function IconTatica3({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-tatica3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07B1A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M8 20c-1 1-2 3-2 5 0 4 3 7 7 7h20c4 0 7-3 7-7 0-2-1-4-2-5" fill="url(#grad-tatica3)" opacity="0.2"/>
      <path d="M10 18v6c0 2-1 4-3 5M38 18v6c0 2 1 4 3 5M14 14v10M24 10v14M34 14v10" stroke="url(#grad-tatica3)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="20" r="2" fill="url(#grad-tatica3)"/>
    </svg>
  )
}

// Marca 1: Prédio/Empresa
export function IconMarca1({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-marca1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path d="M10 36V12c0-2 1-3 3-3h22c2 0 3 1 3 3v24H10z" fill="url(#grad-marca1)" opacity="0.15" stroke="url(#grad-marca1)" strokeWidth="1.5"/>
      <rect x="14" y="16" width="4" height="4" fill="url(#grad-marca1)"/>
      <rect x="22" y="16" width="4" height="4" fill="url(#grad-marca1)"/>
      <rect x="30" y="16" width="4" height="4" fill="url(#grad-marca1)"/>
      <rect x="14" y="24" width="4" height="4" fill="url(#grad-marca1)"/>
      <rect x="22" y="24" width="4" height="4" fill="url(#grad-marca1)"/>
      <rect x="30" y="24" width="4" height="4" fill="url(#grad-marca1)"/>
      <path d="M22 36v-2h4v2" stroke="url(#grad-marca1)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Marca 2: Troféu (Excelência)
export function IconMarca2({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-marca2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path d="M12 14h8v6c0 4-3 6-4 6s-4-2-4-6v-6zM28 14h8v6c0 4-3 6-4 6s-4-2-4-6v-6z" fill="url(#grad-marca2)" opacity="0.2" stroke="url(#grad-marca2)" strokeWidth="1.5"/>
      <path d="M18 20c0 6 6 12 6 12s6-6 6-12" fill="url(#grad-marca2)" opacity="0.3"/>
      <circle cx="24" cy="20" r="4" fill="url(#grad-marca2)"/>
      <path d="M20 36h8M18 40h12" stroke="url(#grad-marca2)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Marca 3: Gráfico crescente
export function IconMarca3({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-marca3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path d="M10 34l6-10 8 6 12-14" fill="none" stroke="url(#grad-marca3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="24" r="3" fill="url(#grad-marca3)" opacity="0.5"/>
      <circle cx="24" cy="30" r="3" fill="url(#grad-marca3)" opacity="0.7"/>
      <circle cx="36" cy="16" r="3" fill="url(#grad-marca3)"/>
      <path d="M34 14v4h4" stroke="url(#grad-marca3)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Stat 1: Número 3 com gráfico
export function IconStat1({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-stat1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <text x="12" y="32" fontSize="24" fontWeight="bold" fill="url(#grad-stat1)">3x</text>
      <path d="M32 28v-8M36 28v-12M40 28v-6" fill="url(#grad-stat1)" opacity="0.4"/>
      <path d="M32 28v-8M36 28v-12M40 28v-6" stroke="url(#grad-stat1)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Stat 2: Percentual
export function IconStat2({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-stat2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <text x="10" y="32" fontSize="24" fontWeight="bold" fill="url(#grad-stat2)">22%</text>
      <path d="M28 16l8 16M36 16l8 16" stroke="url(#grad-stat2)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28 20h6M36 28h6" fill="url(#grad-stat2)"/>
    </svg>
  )
}

// Stat 3: Crescimento
export function IconStat3({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-stat3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <text x="8" y="32" fontSize="24" fontWeight="bold" fill="url(#grad-stat3)">35%</text>
      <path d="M28 28l4-6 4 4 6-10" stroke="url(#grad-stat3)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="22" r="2" fill="url(#grad-stat3)"/>
      <circle cx="36" cy="26" r="2" fill="url(#grad-stat3)"/>
      <circle cx="42" cy="18" r="2" fill="url(#grad-stat3)"/>
    </svg>
  )
}

// Stat 4: Pizza/Proporção
export function IconStat4({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="grad-stat4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <text x="8" y="32" fontSize="24" fontWeight="bold" fill="url(#grad-stat4)">68%</text>
      <circle cx="32" cy="18" r="10" fill="none" stroke="url(#grad-stat4)" strokeWidth="2"/>
      <path d="M32 8A10 10 0 0 1 41.4 12.3" fill="url(#grad-stat4)" opacity="0.4"/>
      <line x1="32" y1="18" x2="41.4" y2="12.3" stroke="url(#grad-stat4)" strokeWidth="1.5"/>
    </svg>
  )
}
