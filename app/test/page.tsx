'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function checkConnection() {
      const { data, error } = await supabase.from('users').select('*').limit(1)
      if (error) {
        setMessage('❌ Connection failed: ' + error.message)
      } else {
        setMessage('✅ Supabase connected! Table "users" is reachable.')
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
