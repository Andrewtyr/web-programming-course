/** URL БД для Vitest (дефолт — локальный Postgres `quiz_test`). */
export function getTestDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@127.0.0.1:5432/quiz_test'
  )
}
