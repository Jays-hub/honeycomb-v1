// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link } from 'react-router'
import { SCENARIOS } from '../data/scenarios.js'
import { hasStarted } from '../lib/store.js'
import { Logo } from './shared.jsx'

export default function Menu() {
  return (
    <main className="narrow">
      <Logo />
      <h1>Prototype menu</h1>
      <p>
        Honeycomb ranks a Georgia Tech student&apos;s school, club, job and personal tasks into one
        &quot;Do this next&quot; card. Pick a scenario to load its sample data.
      </p>
      <p className="note">This prototype uses sample data. Do not enter real links or passwords.</p>
      <ol className="menu">
        {Object.values(SCENARIOS).map((scenario) => (
          <li key={scenario.id}>
            <h2>
              Scenario {scenario.id}: {scenario.name}
            </h2>
            <p>{scenario.summary}</p>
            <Link className="btn btn-primary" to={`/${scenario.id}`}>
              {hasStarted(scenario.id) ? 'Continue' : 'Start'} Scenario {scenario.id}
            </Link>
          </li>
        ))}
      </ol>
      <footer>Team A17, CS 3803. Built with Claude Code (Claude Opus 5.5).</footer>
    </main>
  )
}
