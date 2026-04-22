import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useSubmitScore() {
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState(null)

  // Returns { rowId, finalScore } on success, null on failure.
  // Does NOT set status='saved' — caller must call markSaved() after updating its own state.
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
    let finalScore = score

    if (nameRow) {
      // Name already exists on the leaderboard.
      // Compare as strings to avoid int vs string type mismatch from localStorage.
      if (String(nameRow.id) !== String(existingRowId)) {
        // Different device — name is taken by someone else
        setStatus('error')
        setErrorMsg('That name is already taken. Pick a different one.')
        return null
      }

      // Same device, same name — update score if higher, always update pfp + name
      const updateData = { figpal_pfp: figpalPfp, player_name: playerName }
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
      finalScore = Math.max(score, nameRow.score)

    } else {
      // Brand new name — insert
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
      finalScore = score
    }

    return { rowId, finalScore }
  }

  const markSaved = () => setStatus('saved')

  const reset = () => {
    setStatus('idle')
    setErrorMsg(null)
  }

  return { submit, status, errorMsg, reset, markSaved }
}
