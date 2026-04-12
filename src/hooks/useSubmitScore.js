import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useSubmitScore() {
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState(null)

  const submit = async ({ playerName, score, figpalPfp }) => {
    if (!supabase) {
      setStatus('error')
      setErrorMsg('Supabase not configured')
      return false
    }

    setStatus('saving')
    setErrorMsg(null)

    const { error } = await supabase.from('leaderboard').insert({
      player_name: playerName,
      score,
      figpal_pfp: figpalPfp,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return false
    }

    setStatus('saved')
    return true
  }

  const reset = () => {
    setStatus('idle')
    setErrorMsg(null)
  }

  return { submit, status, errorMsg, reset }
}
