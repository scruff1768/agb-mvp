'use client'

// ✅ Force this page to render dynamically (skip build-time prerender)
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function checkConnection() {
      try {
        // Make sure required envs exist (NEXT_PUBLIC_ are exposed to the client at build)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !anon) {
          setMessage('ℹ️ Supabase env vars not set. Skipping connection test.')
          return
        }

        // Lazy import supabase client only on the client
        const { supabase } = await import('@/lib/supabase')

        const { error } = await supabase.from('users').select('*').limit(1)
        if (error) {
          setMessage('❌ Connection failed: ' + error.message)
        } else {
          setMessage('✅ Supabase connected! Table "users" is reachable.')
        }
      } catch (e: any) {
        setMessage('❌ Connection failed: ' + (e?.message || 'Unknown error'))
      }
    }

    checkConnection()
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>Supabase Test</h1>
      <p>{message}</p>
    </main>
  )
}
