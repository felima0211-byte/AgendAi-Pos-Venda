/**
 * Progressão de tamanhos infantis (BR).
 *
 * A dor da vendedora: "ele comprou 18 meses, daqui a um mês eu ofereço o
 * próximo tamanho". Bebê cresce — o tamanho de hoje não serve amanhã.
 * Este módulo entende o tamanho comprado e sabe qual é o próximo degrau.
 */

// Escada de tamanhos por meses/anos (do menor para o maior).
// Cada degrau ~= 3 meses de crescimento até 24m, depois anual.
const SIZE_LADDER: { key: string; label: string; approxMonths: number }[] = [
  { key: 'rn', label: 'RN (Recém-nascido)', approxMonths: 0 },
  { key: '0-3', label: '0 a 3 meses', approxMonths: 1 },
  { key: '3-6', label: '3 a 6 meses', approxMonths: 4 },
  { key: '6-9', label: '6 a 9 meses', approxMonths: 7 },
  { key: '9-12', label: '9 a 12 meses', approxMonths: 10 },
  { key: '12-18', label: '12 a 18 meses', approxMonths: 15 },
  { key: '18-24', label: '18 a 24 meses', approxMonths: 21 },
  { key: '2', label: '2 anos', approxMonths: 24 },
  { key: '3', label: '3 anos', approxMonths: 36 },
  { key: '4', label: '4 anos', approxMonths: 48 },
  { key: '6', label: '6 anos', approxMonths: 72 },
  { key: '8', label: '8 anos', approxMonths: 96 },
  { key: '10', label: '10 anos', approxMonths: 120 },
]

// Tamanhos por letra (P/M/G) — mapeados aproximadamente à escada de meses.
const LETTER_TO_LADDER: Record<string, string> = {
  rn: 'rn',
  p: '0-3',
  m: '3-6',
  g: '6-9',
  gg: '9-12',
  xg: '12-18',
  xgg: '18-24',
}

export interface SizeInfo {
  /** rótulo legível do tamanho detectado */
  label: string
  /** índice na escada */
  index: number
  key: string
}

export interface SizeProgression {
  current: SizeInfo
  next: SizeInfo | null
}

/**
 * Interpreta um texto livre ("18 meses", "tamanho G", "2 anos", "RN", "P")
 * e devolve o degrau da escada. Retorna null se não reconhecer.
 */
export function parseSize(raw: string | null | undefined): SizeInfo | null {
  if (!raw) return null
  const text = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

  // "recem nascido" / "rn"
  if (/\brn\b|recem[\s-]?nascido/.test(text)) {
    return toInfo('rn')
  }

  // Faixa de meses: "12 a 18", "12-18", "12/18"
  const range = text.match(/(\d{1,2})\s*(?:a|-|\/|até|ate)\s*(\d{1,2})\s*(?:mes|meses|m\b)?/)
  if (range) {
    const key = `${parseInt(range[1])}-${parseInt(range[2])}`
    const found = SIZE_LADDER.find((s) => s.key === key)
    if (found) return toInfo(found.key)
  }

  // Meses soltos: "18 meses", "18m" → encaixa na faixa que contém
  const months = text.match(/(\d{1,2})\s*(?:mes|meses|m\b)/)
  if (months) {
    const m = parseInt(months[1])
    const bucket = monthsToLadderKey(m)
    if (bucket) return toInfo(bucket)
  }

  // Anos: "2 anos", "3a"
  const years = text.match(/(\d{1,2})\s*(?:ano|anos|a\b)/)
  if (years) {
    const y = String(parseInt(years[1]))
    const found = SIZE_LADDER.find((s) => s.key === y)
    if (found) return toInfo(found.key)
  }

  // Letras: P, M, G, GG, XG...
  const letter = text.match(/\b(rn|xgg|xg|gg|g|m|p)\b/)
  if (letter) {
    const ladderKey = LETTER_TO_LADDER[letter[1]]
    if (ladderKey) return toInfo(ladderKey)
  }

  return null
}

/**
 * Dado o tamanho atual, sugere o próximo degrau da escada.
 */
export function nextSize(current: SizeInfo | null): SizeInfo | null {
  if (!current) return null
  const next = SIZE_LADDER[current.index + 1]
  return next ? toInfo(next.key) : null
}

/**
 * Atalho: interpreta o texto e já devolve atual + próximo.
 */
export function getSizeProgression(raw: string | null | undefined): SizeProgression | null {
  const current = parseSize(raw)
  if (!current) return null
  return { current, next: nextSize(current) }
}

// ── helpers ──────────────────────────────────────────────

function toInfo(key: string): SizeInfo {
  const index = SIZE_LADDER.findIndex((s) => s.key === key)
  return { key, index, label: SIZE_LADDER[index].label }
}

function monthsToLadderKey(m: number): string | null {
  if (m <= 0) return 'rn'
  if (m <= 3) return '0-3'
  if (m <= 6) return '3-6'
  if (m <= 9) return '6-9'
  if (m <= 12) return '9-12'
  if (m <= 18) return '12-18'
  if (m <= 24) return '18-24'
  return null
}
