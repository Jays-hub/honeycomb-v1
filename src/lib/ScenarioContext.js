// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { createContext, useContext } from 'react'

export const ScenarioContext = createContext(null)

/** Returns [state, update], where update takes a store action and its arguments. */
export const useScenario = () => useContext(ScenarioContext)
