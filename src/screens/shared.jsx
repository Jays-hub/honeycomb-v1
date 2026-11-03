// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link, useLocation } from 'react-router'
import { useScenario } from '../lib/ScenarioContext.js'
import { isDateChanged, markDone, restoreCanvasDate, sourceLabel, undoDone, unskip } from '../lib/store.js'
import { formatDue, formatDuration } from '../lib/time.js'

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 48 54" role="img" aria-label="Honeycomb logo">
      <polygon points="24,1 47,14 47,40 24,53 1,40 1,14" fill="#1D2330" />
      <polygon points="1,31 47,31 47,40 24,53 1,40" fill="#F5B301" />
    </svg>
  )
}

export function DueText({ task, now }) {
  return (
    <>
      {formatDue(task.due, now)}
      {task.due < now && <strong className="error-text"> Past due</strong>}
    </>
  )
}

export function TaskFacts({ task, now, priority }) {
  return (
    <dl className="facts">
      {task.due != null && (
        <div>
          <dt>Due</dt>
          <dd>
            <DueText task={task} now={now} /> <span className="tag">{sourceLabel(task)}</span>
          </dd>
        </div>
      )}
      <div>
        <dt>Expected time</dt>
        <dd>
          {formatDuration(task.effort)} {task.effortEst && <span className="tag">Est.</span>}
        </dd>
      </div>
      {task.due != null && (
        <div>
          <dt>% of grade</dt>
          <dd>{task.pct == null ? 'Not set' : `${task.pct}%`}</dd>
        </div>
      )}
      {priority && (
        <div>
          <dt>Priority</dt>
          <dd>
            <span className={`priority priority-${priority.toLowerCase()}`}>{priority}</span>
          </dd>
        </div>
      )}
    </dl>
  )
}

export function TaskRow({ task, priority, skipped, hint }) {
  const [state, update] = useScenario()
  const { pathname } = useLocation()
  return (
    <li className={skipped ? 'row row-skipped' : 'row'}>
      <div className="row-head">
        <Link className="row-title" to={`/${state.id}/task/${task.id}`} state={{ from: pathname }}>
          {task.title}
        </Link>
        {skipped && <span className="tag tag-strong">Skipped</span>}
      </div>
      <TaskFacts task={task} now={state.now} priority={priority} />
      {hint && <p className="row-hint">{hint}</p>}
      <div className="row-actions">
        <button type="button" className="btn btn-small" onClick={() => update(markDone, task.id)}>
          Mark done
        </button>
        {skipped && (
          <button type="button" className="btn btn-small" onClick={() => update(unskip, task.id)}>
            Undo skip
          </button>
        )}
        {isDateChanged(task) && (
          <button type="button" className="btn btn-small" onClick={() => update(restoreCanvasDate, task.id)}>
            Restore Canvas date
          </button>
        )}
      </div>
    </li>
  )
}

export function DoneRow({ task }) {
  const [, update] = useScenario()
  return (
    <li className="row row-done">
      <div className="row-head">
        <span className="row-title-done">{task.title}</span>
        <span className="tag">Done</span>
      </div>
      {task.clockMoved != null && (
        <div className="row-actions">
          <button type="button" className="btn btn-small" onClick={() => update(undoDone, task.id)}>
            Undo done
          </button>
        </div>
      )}
    </li>
  )
}
