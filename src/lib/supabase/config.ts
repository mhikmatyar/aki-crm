export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const isPlaceholder =
    !url ||
    !anonKey ||
    url.includes('your-project.supabase.co') ||
    anonKey.includes('your-anon-key')

  return {
    url,
    anonKey,
    isPlaceholder,
  }
}
