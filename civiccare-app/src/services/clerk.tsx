/**
 * Legacy Clerk compatibility alias
 * CivicCare uses native Supabase Authentication (requires no web domain, connects directly to PostgreSQL).
 * All exports are re-exported from @/services/auth.
 */
export * from './auth';
