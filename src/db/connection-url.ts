/**
 * Resolves the Postgres connection string from environment variables.
 *
 * Prefers DATABASE_URL. Otherwise builds the URL from the same POSTGRES_*
 * variables that compose.yaml uses to start the database container.
 */
export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const user = env.POSTGRES_USER;
  const password = env.POSTGRES_PASSWORD;
  const database = env.POSTGRES_DB;

  if (!user || !password || !database) {
    throw new Error(
      "Database connection is not configured: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB in .env",
    );
  }

  const host = env.POSTGRES_HOST || "localhost";
  const port = env.POSTGRES_PORT || "5432";

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}
