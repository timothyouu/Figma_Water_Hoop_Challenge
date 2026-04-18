import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useSubmitScore() {
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState(null)

  // Returns the row id on success, null on failure
  const submit = async ({ playerName, score, figpalPfp, existingRowId }) => {
    if (!supabase) {
      setStatus('error')
      setErrorMsg('Supabase not configured')
      return null
    }

    setStatus('saving')
    setErrorMsg(null)

    // 1. Look up the name in the leaderboard (case-insensitive)
    const { data: nameMatches } = await supabase
      .from('leaderboard')
      .select('id, score')
      .ilike('player_name', playerName)
      .limit(1)

    const nameRow = nameMatches?.[0] ?? null

    let rowId = null

    if (nameRow) {
      // Name already exists on the leaderboard
      if (nameRow.id !== existingRowId) {
        // Different device — name is taken by someone else
        setStatus('error')
        setErrorMsg('That name is already taken. Pick a different one.')
        return null
      }

      // Same device, same name — update score if higher, always update pfp
      const updateData = { figpal_pfp: figpalPfp }
      if (score > nameRow.score) updateData.score = score

      const { error } = await supabase
        .from('leaderboard')
        .update(updateData)
        .eq('id', nameRow.id)

      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
        return null
      }
      rowId = nameRow.id

    } else {
      // Brand new player on this device — insert
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({ player_name: playerName, score, figpal_pfp: figpalPfp })
        .select('id')
        .single()

      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
        return null
      }
      rowId = data?.id ?? null
    }

    setStatus('saved')
    return rowId
  }

  const reset = () => {
    setStatus('idle')
    setErrorMsg(null)
  }

  return { submit, status, errorMsg, reset }
}
