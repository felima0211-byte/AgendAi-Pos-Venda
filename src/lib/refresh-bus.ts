'use client'

// Barramento simples de atualização: componentes do dashboard reagem na hora
// após um atendimento/venda, sem esperar reload.
const EVENT = 'agendai:refresh'

export function emitRefresh() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT))
}

export function onRefresh(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
