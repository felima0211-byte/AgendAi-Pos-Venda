/**
 * Erros de domínio da aplicação (Camada 4 — Fail Fast / Fail Secure).
 * Carregam o status HTTP e uma mensagem segura para o cliente (sem vazar interno).
 */
export class ApiException extends Error {
  status: number
  code?: string
  constructor(message: string, status = 400, code?: string) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.code = code
  }
}

export class UnauthorizedError extends ApiException {
  constructor(message = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiException {
  constructor(message = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends ApiException {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends ApiException {
  constructor(message = 'Dados inválidos') {
    super(message, 422, 'VALIDATION')
  }
}

export class RateLimitError extends ApiException {
  constructor(message = 'Muitas requisições. Tente novamente em instantes.') {
    super(message, 429, 'RATE_LIMIT')
  }
}
