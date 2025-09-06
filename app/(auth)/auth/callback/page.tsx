'use client'

// ✅ Force this page to render dynamically (skip build-time prerender)
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [msg, setMsg] = useState('Finishing sign-in…')

  useEffect(() => {
    async function run() {
      // If using PKCE (default), Google redirects with ?code= and ?state=
      const code = params.get('code')
      const error = params.get('error_description') || params.get('error')

      if (error) {
        setMsg(`Sign-in error: ${error}`)
        return
      }

      try {
        if (code) {
          // Exchange the code for a Supabase session
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) throw error
        }
        // If already has a session, just continue
        router.replace('/play')
      } catch (e: any) {
        setMsg(`Sign-in failed: ${e?.message || 'Unknown error'}`)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Signing you in…</h1>
        <p className="lead" style={{ marginTop: 8 }}>{msg}</p>
      </div>
    </main>
  )
}
