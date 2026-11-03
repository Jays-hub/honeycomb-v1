// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link } from 'react-router'
import { whyFirst } from '../lib/rank.js'
import { useScenario } from '../lib/ScenarioContext.js'
import { cardTask, ranking } from '../lib/store.js'

export default function Why() {
  const [state] = useScenario()
  const task = cardTask(state)
  const result = ranking(state)
  return (
    <div className="narrow">
      <p>
        <Link to={`/${state.id}/home`}>Back to Home</Link>
      </p>
      <h1>Why this first</h1>
      {task ? (
        <>
          <h2>{task.title}</h2>
          {whyFirst(task, result, state.now, state.blocks, state.skipped).map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </>
      ) : (
        <p>No task is on the card right now.</p>
      )}
      <details className="panel">
        <summary>How ranking works</summary>
        <ol className="how">
          <li>
            If everything can&apos;t fit in deadline order, the lowest-weight task that can help moves
            under &quot;Won&apos;t fit in time.&quot; This repeats until the rest fit. Tasks with no % never move.
          </li>
          <li>
            The rest rank by least spare time: free time until the task is due, outside classes and
            shifts, minus the time the task takes.
          </li>
          <li>Ties go to % of course grade, then the order on the Cells screen.</li>
          <li>If that order would make a task late, the list uses deadline order instead.</li>
        </ol>
        <p>Honeycomb does not consider difficulty, late policy, class standing or sleep.</p>
      </details>
    </div>
  )
}
