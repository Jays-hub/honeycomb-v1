// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link, useLocation } from 'react-router'
import { overloadLine, priorityLabels } from '../lib/rank.js'
import { SCENARIOS } from '../data/scenarios.js'
import { useScenario } from '../lib/ScenarioContext.js'
import { cardTask, markDone, ranking, skip, unskipAll } from '../lib/store.js'
import { addDays, formatDuration, formatTime, startOfWeek } from '../lib/time.js'
import { DoneRow, TaskFacts, TaskRow } from './shared.jsx'

function Card({ labels }) {
  const [state, update] = useScenario()
  const open = state.tasks.filter((t) => !t.done && t.due != null)
  const task = cardTask(state)

  if (!task) {
    return (
      <section className="card">
        <h1>Do this next</h1>
        {open.length > 0 ? (
          <>
            <p className="card-title">You skipped everything that is left.</p>
            <div className="actions">
              <button type="button" className="btn btn-ink" onClick={() => update(unskipAll)}>
                Show skipped tasks
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="card-title">Nothing is ranked right now.</p>
            <p>Add a task with a due date and it shows up here.</p>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="card">
      <h1>Do this next</h1>
      <p className="card-title">{task.title}</p>
      <p className="card-cell">{task.cell}</p>
      <TaskFacts task={task} now={state.now} priority={labels.get(task.id)} />
      <p>
        <Link className="card-link" to={`/${state.id}/why`}>
          Why this first
        </Link>
      </p>
      <div className="actions">
        <button type="button" className="btn btn-ink" onClick={() => update(markDone, task.id)}>
          Mark done
        </button>
        <button type="button" className="btn btn-outline-ink" onClick={() => update(skip, task.id)}>
          Not now
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  const [state] = useScenario()
  const { pathname } = useLocation()
  const { order, below, overload } = ranking(state)
  const line = overloadLine(state.tasks, state.now, state.blocks)
  const labels = new Map(priorityLabels(order.length).map((label, i) => [order[i].id, label]))
  below.forEach((task) => labels.set(task.id, 'Low'))

  const weekEnd = addDays(startOfWeek(state.now), 7)
  const thisWeek = order.filter((task) => task.due < weekEnd)
  const laterCount = order.length - thisWeek.length
  const undated = state.tasks.filter((t) => t.due == null && !t.done)
  const done = state.tasks.filter((t) => t.done && t.clockMoved != null)
  const needsSetup = SCENARIOS[state.id].needsConnect && !(state.canvas && state.google)
  const isEmpty = state.tasks.length === 0

  return (
    <div className="home">
      <Card labels={labels} />
      <div className="lists">
        {needsSetup && (
          <p className="panel">
            {isEmpty ? 'No tasks yet. ' : 'Setup is not finished. '}
            <Link to={`/${state.id}/connect`}>Connect Canvas and Google Calendar</Link>
          </p>
        )}
        <div className="list-head">
          <h2>This week</h2>
          <Link className="btn btn-primary" to={`/${state.id}/add`} state={{ from: pathname }}>
            Add task
          </Link>
        </div>
        {line && (
          <p className="overload">
            {formatDuration(line.work)} of work and {formatDuration(line.left)} left before{' '}
            {formatTime(line.deadline)}.
            {overload && ' Tasks with no % stay in the list, so add a % to let Honeycomb choose what to move.'}
          </p>
        )}
        {thisWeek.length > 0 ? (
          <ol className="rows">
            {thisWeek.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                priority={labels.get(task.id)}
                skipped={state.skipped.includes(task.id)}
              />
            ))}
          </ol>
        ) : (
          <p className="empty">Nothing else is ranked for this week.</p>
        )}
        {laterCount > 0 && (
          <p className="later">
            {laterCount} more {laterCount === 1 ? 'task is' : 'tasks are'} due after this week.{' '}
            <Link to={`/${state.id}/week`}>Open your week</Link>
          </p>
        )}
        {below.length > 0 && (
          <>
            <h2>Won&apos;t fit in time</h2>
            <p className="group-note">
              Tasks here have the lowest % of grade among those that could free up time, so missing them
              costs you the least.
            </p>
            <ul className="rows">
              {below.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  priority="Low"
                  skipped={state.skipped.includes(task.id)}
                />
              ))}
            </ul>
          </>
        )}
        {undated.length > 0 && (
          <>
            <h2>No due date</h2>
            <ul className="rows">
              {undated.map((task) => (
                <TaskRow key={task.id} task={task} hint="Add a due date to rank this." />
              ))}
            </ul>
          </>
        )}
        {done.length > 0 && (
          <>
            <h2>Done</h2>
            <ul className="rows">
              {done.map((task) => (
                <DoneRow key={task.id} task={task} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
