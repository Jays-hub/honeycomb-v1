// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { useEffect } from 'react'

/** Runs the callback when Esc is pressed anywhere on the screen. */
export function useEscape(onEscape) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onEscape()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onEscape])
}
