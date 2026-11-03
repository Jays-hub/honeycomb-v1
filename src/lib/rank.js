// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
// The ranking rules from docs/build-notes.md.
import { finishTime, freeMinutes, formatDuration } from './time.js'

export const CELLS = ['Classes', 'Clubs', 'Work', 'Health', 'Personal goals']

const cellIndex = (task) => CELLS.indexOf(task.cell)

const byDeadline = (a, b) => a.due - b.due || b.effort - a.effort

export const spareTime = (task, now, blocks = []) => freeMinutes(now, task.due, blocks) - task.effort

/** Index of the first task that finishes after its due time, working in list order from now. */
function firstLateIndex(list, now, blocks) {
  let cursor = now
  for (let i = 0; i < list.length; i += 1) {
    cursor = finishTime(cursor, list[i].effort, blocks)
    if (cursor > list[i].due) return i
  }
  return -1
}

/**
 * Ranks dated, unfinished tasks.
 * Returns { order, below, overload, deadlineOrder }: the ranked list, the tasks under
 * "Won't fit in time", whether an overload remains that nothing can relieve, and whether the list
 * fell back to deadline order.
 */
export function rank(tasks, now, blocks = []) {
  const keep = tasks.filter((task) => task.due != null && !task.done).sort(byDeadline)
  const below = []
  let overload = false

  for (;;) {
    const late = firstLateIndex(keep, now, blocks)
    if (late === -1) break
    const candidates = keep.slice(0, late + 1).filter((task) => task.pct != null)
    if (candidates.length === 0) {
      overload = true
      break
    }
    const cheapest = candidates.reduce((best, task) =>
      task.pct < best.pct || (task.pct === best.pct && task.effort > best.effort) ? task : best,
    )
    keep.splice(keep.indexOf(cheapest), 1)
    below.push(cheapest)
  }

  const spare = new Map(keep.map((task) => [task.id, spareTime(task, now, blocks)]))
  const bySpare = [...keep].sort(
    (a, b) =>
      spare.get(a.id) - spare.get(b.id) ||
      (b.pct ?? -1) - (a.pct ?? -1) ||
      cellIndex(a) - cellIndex(b),
  )
  const deadlineOrder = firstLateIndex(bySpare, now, blocks) !== -1

  return { order: deadlineOrder ? keep : bySpare, below, overload, deadlineOrder }
}

/** High, Medium and Low by rank position, rounding toward High. */
export function priorityLabels(count) {
  const high = Math.ceil(count / 3)
  const medium = Math.ceil((count - high) / 2)
  return Array.from({ length: count }, (_, i) =>
    i < high ? 'High' : i < high + medium ? 'Medium' : 'Low',
  )
}

/** Work against time left at the first late task, before anything moves. Null when it all fits. */
export function overloadLine(tasks, now, blocks = []) {
  const list = tasks.filter((task) => task.due != null && !task.done).sort(byDeadline)
  const late = firstLateIndex(list, now, blocks)
  if (late === -1) return null
  const deadline = list[late].due
  const work = list.filter((task) => task.due <= deadline).reduce((sum, task) => sum + task.effort, 0)
  return { work, left: freeMinutes(now, deadline, blocks), deadline }
}

/** "Why this first" sentences. Each one cites a factor that actually decided the order. */
export function whyFirst(task, ranking, now, blocks = [], skipped = []) {
  const reasons = []
  const position = ranking.order.indexOf(task)
  const passed = ranking.order.slice(0, Math.max(position, 0)).filter((t) => skipped.includes(t.id))
  if (passed.length > 0) {
    reasons.push(`You skipped ${passed.map((t) => t.title).join(' and ')}, so this is the next task.`)
  }
  if (position === -1) {
    reasons.push('Nothing left fits before its deadline. This task has the highest rank of what remains.')
    return reasons
  }
  const next = ranking.order[position + 1]
  if (!next) {
    reasons.push('It is the only ranked task left.')
    return reasons
  }
  if (ranking.deadlineOrder) {
    reasons.push(
      `Deadline order is the only order that keeps these tasks on time, and this one comes before ${next.title}.`,
    )
    return reasons
  }
  const mine = spareTime(task, now, blocks)
  const theirs = spareTime(next, now, blocks)
  if (mine !== theirs) {
    reasons.push(
      `It has the least spare time: ${formatDuration(mine)} free after the work is done. ${next.title} is next, with ${formatDuration(theirs)}.`,
    )
  } else if ((task.pct ?? -1) !== (next.pct ?? -1)) {
    reasons.push(
      `It has the same spare time as ${next.title} (${formatDuration(mine)}) and is worth more of your grade.`,
    )
  } else {
    reasons.push(
      `It ties with ${next.title} on spare time and grade weight, and ${task.cell} comes first in your cell order.`,
    )
  }
  return reasons
}
