export async function register() {
  // Postgres hydration runs lazily via ensureStoreReady() in API routes.
  // Keeping instrumentation free of @/lib/db avoids webpack pulling fs into the client bundle.
}
