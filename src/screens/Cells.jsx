// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link, Navigate, useLocation, useParams } from 'react-router'
import { CELLS, priorityLabels } from '../lib/rank.js'
import { useScenario } from '../lib/ScenarioContext.js'
import { ranking } from '../lib/store.js'
import { DoneRow, TaskRow } from './shared.jsx'

const progress = (tasks, cell) => {
  const inCell = tasks.filter((t) => t.cell === cell)
  return { done: inCell.filter((t) => t.done).length, total: inCell.length }
}

export function CellsOverview() {
  const [state] = useScenario()
  return (
    <div>
      <h1>Cells</h1>
      <p>Ties in your ranked list go to the cell that comes first here.</p>
      <ol className="comb">
        {CELLS.map((cell) => {
          const { done, total } = progress(state.tasks, cell)
          const fill = total === 0 ? 0 : Math.round((done / total) * 100)
          return (
            <li key={cell}>
              <Link className="hex" style={{ '--fill': `${fill}%` }} to={`/${state.id}/cells/${encodeURIComponent(cell)}`}>
                <span className="hex-name">{cell}</span>
                <span className="hex-count">
                  {done} of {total} done
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function CellDetail() {
  const [state] = useScenario()
  const { pathname } = useLocation()
  const { cell } = useParams()
  if (!CELLS.includes(cell)) return <Navigate to={`/${state.id}/cells`} replace />

  const { order, below } = ranking(state)
  const labels = new Map(priorityLabels(order.length).map((label, i) => [order[i].id, label]))
  below.forEach((task) => labels.set(task.id, 'Low'))
  const inCell = (task) => task.cell === cell
  const ranked = [...order, ...below].filter(inCell)
  const undated = state.tasks.filter((t) => inCell(t) && t.due == null && !t.done)
  const done = state.tasks.filter((t) => inCell(t) && t.done)
  const { done: doneCount, total } = progress(state.tasks, cell)

  return (
    <div className="narrow">
      <p>
        <Link to={`/${state.id}/cells`}>Back to Cells</Link>
      </p>
      <h1>{cell}</h1>
      <div className="list-head">
        <p className="count">
          {doneCount} of {total} done
        </p>
        <Link
          className="btn btn-primary"
          to={`/${state.id}/add?cell=${encodeURIComponent(cell)}`}
          state={{ from: pathname }}
        >
          Add task
        </Link>
      </div>
      {total === 0 && <p className="empty">No tasks in this cell yet.</p>}
      {ranked.length > 0 && (
        <ol className="rows">
          {ranked.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              priority={labels.get(task.id)}
              skipped={state.skipped.includes(task.id)}
            />
          ))}
        </ol>
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
  )
}
