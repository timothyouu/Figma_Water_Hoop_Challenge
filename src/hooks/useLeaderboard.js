import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useLeaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTop5 = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('leaderboard')
      .select('id, player_name, score, figpal_pfp, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTop5()

    if (!supabase) return

    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => fetchTop5()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { rows, loading, error, refetch: fetchTop5 }
}
