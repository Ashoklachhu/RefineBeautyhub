// ============================================================
// Typed API result — avoids throwing errors across the codebase
// Every service function returns ServiceResult<T>
// ============================================================

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: AppError }

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public status: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  notFound:        (resource = 'Record') => new AppError(`${resource} not found`, 'NOT_FOUND', 404),
  unauthorized:    ()                    => new AppError('You must be logged in', 'UNAUTHORIZED', 401),
  forbidden:       ()                    => new AppError('You do not have permission', 'FORBIDDEN', 403),
  conflict:        (msg: string)         => new AppError(msg, 'CONFLICT', 409),
  validation:      (msg: string)         => new AppError(msg, 'VALIDATION_ERROR', 400),
  database:        (msg: string)         => new AppError(msg, 'DATABASE_ERROR', 500),
  unknown:         (msg = 'An unexpected error occurred') => new AppError(msg, 'UNKNOWN_ERROR', 500),
} as const

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

export function fail<T = never>(error: AppError): ServiceResult<T> {
  return { data: null, error }
}

// Extract Supabase error message cleanly
export function fromSupabaseError(err: { message?: string; code?: string } | null): AppError {
  if (!err) return Errors.unknown()
  const msg = err.message ?? 'Database error'
  // Map known Postgres error codes
  if (err.code === '23505') return Errors.conflict('This record already exists')
  if (err.code === '23503') return Errors.validation('Related record not found')
  if (err.code === '42501') return Errors.forbidden()
  return new AppError(msg, err.code ?? 'DB_ERROR', 500)
}
