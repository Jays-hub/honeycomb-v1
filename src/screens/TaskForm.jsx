// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { useCallback, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { CELLS } from '../lib/rank.js'
import { useScenario } from '../lib/ScenarioContext.js'
import { addTask, editTask, isDateChanged, restoreCanvasDate } from '../lib/store.js'
import {
  addDays,
  formatDateTime,
  formatDay,
  formatDuration,
  minutesIntoDay,
  parseDuration,
  startOfDay,
  startOfWeek,
} from '../lib/time.js'
import { useEscape } from '../lib/useEscape.js'

const toClock = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

function fromClock(text) {
  const [hours, minutes] = text.split(':').map(Number)
  return hours * 60 + minutes
}

const END_OF_DAY = '23:59'

export default function TaskForm() {
  const [state, update] = useScenario()
  const { taskId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state: nav } = useLocation()
  const task = taskId ? state.tasks.find((t) => t.id === taskId) : null

  const backTo = nav?.from ?? `/${state.id}/home`
  const goBack = useCallback(() => navigate(backTo), [navigate, backTo])
  useEscape(goBack)

  const [title, setTitle] = useState(task?.title ?? '')
  const [cell, setCell] = useState(task?.cell ?? params.get('cell') ?? CELLS[0])
  const [day, setDay] = useState(task?.due != null ? String(startOfDay(task.due)) : '')
  const [time, setTime] = useState(task?.due != null ? toClock(minutesIntoDay(task.due)) : '')
  const [effort, setEffort] = useState(task && !task.effortEst ? formatDuration(task.effort) : '')
  const [pct, setPct] = useState(task?.pct != null ? String(task.pct) : '')
  const [errors, setErrors] = useState({})
  const [open, setOpen] = useState(Boolean(task))

  if (taskId && !task) return <Navigate to={`/${state.id}/home`} replace />

  const today = startOfDay(state.now)
  const lastDay = addDays(startOfWeek(state.now), 20)
  const days = []
  for (let d = today; d <= lastDay; d = addDays(d, 1)) days.push(d)
  if (day && !days.includes(Number(day))) days.unshift(Number(day))

  const chooseDay = (value) => {
    setDay(String(value))
    if (!time) setTime(END_OF_DAY)
  }

  const chooseSelectedDay = (value) => {
    setDay(value)
    if (!value) setTime('')
  }

  const submit = (event) => {
    event.preventDefault()
    const found = {}
    let due = null
    if (!title.trim()) found.title = 'Enter a title for this task.'
    if (day) {
      due = Number(day) + fromClock(time || END_OF_DAY)
      if (due < state.now && due !== task?.due) {
        found.due = `That time has passed. It is ${formatDateTime(state.now)} in this demo, so choose a later day or time.`
      }
    } else if (time) {
      found.due = 'Choose a day for this time, or clear the time.'
    }
    const minutes = effort.trim() ? parseDuration(effort) : null
    if (effort.trim() && minutes == null) found.effort = 'Enter a time like 45m or 1h 30m.'
    const weight = pct.trim() === '' ? null : Number(pct)
    if (weight != null && !(weight > 0 && weight <= 100)) {
      found.pct = 'Enter a number from 1 to 100, or leave this blank.'
    }
    setErrors(found)
    if (Object.keys(found).length > 0) {
      if (found.due || found.effort || found.pct) setOpen(true)
      return
    }
    const form = { title: title.trim(), cell, due, effort: minutes, pct: weight }
    if (task) update(editTask, task.id, form)
    else update(addTask, form)
    navigate(backTo, { state: { keepToast: true } })
  }

  const fieldError = (name) =>
    errors[name] && (
      <p className="error" role="alert" id={`${name}-error`}>
        {errors[name]}
      </p>
    )

  return (
    <div className="narrow">
      <h1>{task ? 'Edit task' : 'Add task'}</h1>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            autoFocus={!task}
            value={title}
            aria-invalid={Boolean(errors.title)}
            onChange={(e) => setTitle(e.target.value)}
          />
          {fieldError('title')}
        </div>
        <label className="field">
          <span>Cell</span>
          <select value={cell} onChange={(e) => setCell(e.target.value)}>
            {CELLS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <details className="more" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
          <summary>More details</summary>
          <fieldset className="field">
            <legend>Due date</legend>
            <div className="actions">
              <button type="button" className="btn btn-small" onClick={() => chooseDay(today)}>
                Tonight
              </button>
              <button type="button" className="btn btn-small" onClick={() => chooseDay(addDays(today, 1))}>
                Tomorrow
              </button>
            </div>
            <div className="due-fields">
              <label className="field">
                <span>Day</span>
                <select value={day} aria-invalid={Boolean(errors.due)} onChange={(e) => chooseSelectedDay(e.target.value)}>
                  <option value="">No due date</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {formatDay(d)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Time</span>
                <input type="time" value={time} aria-invalid={Boolean(errors.due)} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            {fieldError('due')}
            {task && isDateChanged(task) && (
              <div className="restore">
                <span className="tag">Changed by you</span>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => { update(restoreCanvasDate, task.id); navigate(backTo, { state: { keepToast: true } }) }}
                >
                  Restore Canvas date
                </button>
              </div>
            )}
          </fieldset>
          <div className="field">
            <label htmlFor="effort">Expected time</label>
            <input
              id="effort"
              value={effort}
              placeholder={task?.effortEst ? `Est. ${formatDuration(task.effort)}` : 'Like 45m or 1h 30m'}
              aria-invalid={Boolean(errors.effort)}
              onChange={(e) => setEffort(e.target.value)}
            />
            <p className="hint">Leave blank for an estimate based on the type of task.</p>
            {fieldError('effort')}
          </div>
          <div className="field">
            <label htmlFor="pct">% of course grade (optional)</label>
            <input
              id="pct"
              inputMode="decimal"
              value={pct}
              aria-invalid={Boolean(errors.pct)}
              onChange={(e) => setPct(e.target.value)}
            />
            {fieldError('pct')}
          </div>
        </details>
        <div className="actions form-actions">
          <button type="submit" className="btn btn-primary">
            Save task
          </button>
          <button type="button" className="btn" onClick={goBack}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
