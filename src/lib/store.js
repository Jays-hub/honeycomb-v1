// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
// Scenario state and the actions on it. Every function here is pure except load, save and clear.
import { DEMO_START, SCENARIOS, SCENARIO_2_BLOCKS, SCENARIO_2_IMPORT } from '../data/scenarios.js'
import { rank } from './rank.js'
import { formatDateTime, formatDuration, formatTime } from './time.js'

const key = (id) => `honeycomb-scenario-${id}`

export function initialState(id) {
  const scenario = SCENARIOS[id]
  return {
    id,
    loggedIn: false,
    now: DEMO_START,
    tasks: scenario.tasks(),
    blocks: scenario.blocks(),
    skipped: [],
    canvas: false,
    google: false,
    toast: null,
    nextId: 1,
  }
}

export function load(id) {
  try {
    const saved = sessionStorage.getItem(key(id))
    return saved ? JSON.parse(saved) : initialState(id)
  } catch {
    return initialState(id)
  }
}

export const save = (state) => sessionStorage.setItem(key(state.id), JSON.stringify(state))
export const hasStarted = (id) => sessionStorage.getItem(key(id)) != null
export const clear = (id) => sessionStorage.removeItem(key(id))

const EFFORT_BY_TYPE = [
  [/quiz/i, 30],
  [/exam|midterm|final|\btest\b/i, 120],
  [/\blab\b|report/i, 120],
  [/essay|paper|draft/i, 120],
  [/homework|\bhw\b|problem set/i, 90],
  [/reading/i, 45],
  [/discussion|\bpost\b/i, 25],
]

/** The estimate for a task with no expected time, by the task type its title names. */
export function defaultEffort(title) {
  return EFFORT_BY_TYPE.find(([pattern]) => pattern.test(title))?.[1] ?? 60
}

/** Where a logged-in student lands: setup first if this scenario still needs it. */
export function homePathAfterLogin(state) {
  const needsSetup = SCENARIOS[state.id].needsConnect && !(state.canvas && state.google)
  return `/${state.id}/${needsSetup ? 'connect' : 'home'}`
}

export const ranking = (state) => rank(state.tasks, state.now, state.blocks)

/** The task the card suggests: the first ranked task not skipped, then what is under the line. */
export function cardTask(state) {
  const { order, below } = ranking(state)
  return [...order, ...below].find((task) => !state.skipped.includes(task.id)) ?? null
}

export const isDateChanged = (task) =>
  task.source === 'canvas' && task.canvasDue !== undefined && task.due !== task.canvasDue

export function sourceLabel(task) {
  if (isDateChanged(task)) return 'Changed by you'
  return task.source === 'canvas' ? 'From Canvas' : 'Added by you'
}

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'}`

const positionOf = (state, id) => {
  const index = ranking(state).order.findIndex((task) => task.id === id)
  return index === -1 ? null : index + 1
}

const snapshot = ({ now, tasks, skipped }) => ({ now, tasks, skipped })
const withToast = (next, text, before) => ({
  ...next,
  toast: { text, undo: before ? snapshot(before) : null },
})

export const dismissToast = (state) => ({ ...state, toast: null })
export const logIn = (state) => ({ ...state, loggedIn: true })

export const undoLast = (state) =>
  state.toast?.undo ? { ...state, ...state.toast.undo, toast: { text: 'Undone.', undo: null } } : state

export function markDone(state, id) {
  const task = state.tasks.find((t) => t.id === id)
  const now = state.now + task.effort
  const next = {
    ...state,
    now,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: true, clockMoved: t.effort } : t)),
    skipped: state.skipped.filter((other) => other !== id),
  }
  return withToast(
    next,
    `Marked ${task.title} done. The clock moved ahead ${formatDuration(task.effort)} to ${formatTime(now)}.`,
    state,
  )
}

export function undoDone(state, id) {
  const task = state.tasks.find((t) => t.id === id)
  const next = {
    ...state,
    now: state.now - (task.clockMoved ?? 0),
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: false, clockMoved: undefined } : t)),
  }
  return withToast(next, `${task.title} is back on your list.`)
}

export function skip(state, id) {
  const task = state.tasks.find((t) => t.id === id)
  const next = { ...state, skipped: [...state.skipped, id] }
  return withToast(next, `Skipped ${task.title}. It stays in your list, marked Skipped.`, state)
}

export function unskip(state, id) {
  const task = state.tasks.find((t) => t.id === id)
  const next = { ...state, skipped: state.skipped.filter((other) => other !== id) }
  return withToast(next, `${task.title} is no longer skipped.`)
}

export const unskipAll = (state) =>
  withToast({ ...state, skipped: [] }, 'Skipped tasks are back on the card.')

function buildFields(form) {
  const est = form.effort == null
  return {
    title: form.title,
    cell: form.cell,
    due: form.due,
    pct: form.pct,
    effort: est ? defaultEffort(form.title) : form.effort,
    effortEst: est,
  }
}

export function addTask(state, form) {
  const id = `added-${state.nextId}`
  const task = { id, source: 'user', done: false, ...buildFields(form) }
  const next = { ...state, nextId: state.nextId + 1, tasks: [...state.tasks, task] }
  const position = positionOf(next, id)
  let where = `It is under No due date in ${task.cell}.`
  if (task.due != null) {
    where = position ? `It ranks ${ordinal(position)}.` : "It is under Won't fit in time."
  }
  return withToast(next, `Added ${task.title}. ${where}`, state)
}

function movementText(before, after) {
  if (before === after || !before || !after) return ''
  return ` It moved from ${ordinal(before)} to ${ordinal(after)}.`
}

export function editTask(state, id, form) {
  const old = state.tasks.find((t) => t.id === id)
  const fields = buildFields(form)
  // A blank expected time keeps the current estimate rather than replacing it.
  const updated = form.effort == null && old.effortEst ? { ...fields, effort: old.effort } : fields
  const next = { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }
  const moved = movementText(positionOf(state, id), positionOf(next, id))
  const headline =
    old.due !== form.due && form.due != null
      ? `${form.title} is now due ${formatDateTime(form.due)}.`
      : `Saved ${form.title}.`
  return withToast(next, `${headline}${moved}`, state)
}

export function restoreCanvasDate(state, id) {
  const task = state.tasks.find((t) => t.id === id)
  const next = {
    ...state,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, due: t.canvasDue } : t)),
  }
  const moved = movementText(positionOf(state, id), positionOf(next, id))
  return withToast(next, `Restored the Canvas date for ${task.title}.${moved}`, state)
}

export function connectCanvas(state) {
  const fresh = SCENARIO_2_IMPORT.filter((t) => !state.tasks.some((other) => other.id === t.id))
  return { ...state, canvas: true, tasks: [...state.tasks, ...fresh] }
}

export const connectGoogle = (state) => ({ ...state, google: true, blocks: SCENARIO_2_BLOCKS })
