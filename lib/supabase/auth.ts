import { createClient } from './client'

export type OAuthProvider = 'google' | 'github' | 'discord'

export const signInWithOAuth = async (provider: OAuthProvider) => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
