'use client'

import { useSearchParams } from 'next/navigation'

const CLERK_ERROR_MESSAGES: Record<string, string> = {
  session_exists: 'Você já está autenticado.',
  identifier_already_signed_in: 'Esta conta já está conectada.',
  form_identifier_not_found: 'E-mail não encontrado.',
  form_password_incorrect: 'Senha incorreta.',
  too_many_requests: 'Muitas tentativas. Aguarde alguns minutos.',
  network_error: 'Erro de conexão. Verifique sua internet.',
}

export function useAuthError() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')

  const message = errorCode
    ? (CLERK_ERROR_MESSAGES[errorCode] ?? 'Ocorreu um erro. Tente novamente.')
    : null

  return { errorCode, message, hasError: !!message }
}
