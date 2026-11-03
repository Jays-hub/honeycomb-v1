// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
// Demo times are wall-clock minutes, stored as whole minutes on a UTC calendar. That keeps the demo
// identical in every time zone and free of daylight-saving jumps.

const DAY = 1440
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Wall-clock minutes for a date in November 2026 unless a month (1-12) is given. */
export const at = (day, hour = 0, minute = 0, month = 11) =>
  Date.UTC(2026, month - 1, day, hour, minute) / 60000

const toDate = (t) => new Date(t * 60000)

export const startOfDay = (t) => Math.floor(t / DAY) * DAY
export const addDays = (t, days) => t + days * DAY
export const startOfWeek = (t) => addDays(startOfDay(t), -toDate(t).getUTCDay())
export const minutesIntoDay = (t) => t - startOfDay(t)

export function formatTime(t) {
  const d = toDate(t)
  const hour = d.getUTCHours()
  const minute = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`
}

export function formatDay(t) {
  const d = toDate(t)
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export const formatDateTime = (t) => `${formatDay(t)}, ${formatTime(t)}`

/** A due time in words, relative to the demo clock. */
export function formatDue(t, now) {
  if (startOfDay(t) === startOfDay(now)) {
    return `${minutesIntoDay(now) >= 17 * 60 ? 'Tonight' : 'Today'}, ${formatTime(t)}`
  }
  return formatDateTime(t)
}

export function formatDuration(minutes) {
  const sign = minutes < 0 ? '-' : ''
  const total = Math.abs(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${sign}${rest}m`
  return `${sign}${hours}h${rest ? ` ${rest}m` : ''}`
}

/** Reads "45", "45m", "1h", "1h 30m" or "1.5h". Returns minutes, or null if it can't be read. */
export function parseDuration(text) {
  const value = text.trim().toLowerCase()
  const match = value.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*(?:m|mins?|minutes?)?)?$/)
  if (!value || !match) return null
  const minutes = Math.round(Number(match[1] ?? 0) * 60) + Number(match[2] ?? 0)
  return minutes > 0 ? minutes : null
}

/** Free minutes between two times, outside fixed blocks. */
export function freeMinutes(from, to, blocks = []) {
  if (to <= from) return 0
  let free = to - from
  let cursor = from
  const sorted = [...blocks].sort((a, b) => a.start - b.start)
  for (const block of sorted) {
    const start = Math.max(block.start, cursor)
    const end = Math.min(block.end, to)
    if (end > start) {
      free -= end - start
      cursor = end
    }
  }
  return free
}

/** When work of this length ends if it starts at `start` and pauses for fixed blocks. */
export function finishTime(start, effort, blocks = []) {
  let cursor = start
  let left = effort
  const sorted = [...blocks].sort((a, b) => a.start - b.start)
  for (const block of sorted) {
    if (block.end <= cursor) continue
    if (block.start >= cursor + left) break
    left -= Math.max(block.start - cursor, 0)
    cursor = block.end
  }
  return cursor + left
}
