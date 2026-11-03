// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
// Fictional sample data for the three scenarios, from docs/build-notes.md.
import { addDays, at } from '../lib/time.js'

export const DEMO_START = at(8, 19, 0)
export const SAMPLE_FEED_LINK = 'https://canvas.example.edu/feeds/calendars/user_SAMPLE.ics'
const WEEKS = [0, 7, 14]

const task = (id, title, cell, due, effort, extra = {}) => ({
  id,
  title,
  cell,
  due,
  effort,
  pct: null,
  effortEst: true,
  source: 'user',
  done: false,
  ...extra,
})

const canvas = (due) => ({ source: 'canvas', canvasDue: due })
const canvasTask = (id, title, due, effort, pct = null) =>
  task(id, title, 'Classes', due, effort, { pct, ...canvas(due) })

export const QUIZ = { title: 'HIST 2111 Reading Quiz', due: at(8, 21, 0), effort: 45, pct: 3 }

/** The same block on the same weekday in each of the three weeks the Week screen shows. */
function weekly(id, title, kind, day, startHour, startMinute, endHour, endMinute, place) {
  return WEEKS.map((offset) => ({
    id: `${id}-${offset}`,
    title,
    kind,
    place,
    start: addDays(at(day, startHour, startMinute), offset),
    end: addDays(at(day, endHour, endMinute), offset),
  }))
}

const CLASS_BLOCKS_2 = [
  ...[9, 11, 13].flatMap((day) =>
    weekly(`math-${day}`, 'MATH 1554 class', 'class', day, 9, 30, 10, 20, 'Skiles 268'),
  ),
  ...[10, 12].flatMap((day) =>
    weekly(`chem-${day}`, 'CHEM 1310 class', 'class', day, 11, 0, 12, 15, 'Boggs B9'),
  ),
  ...[9, 11, 13].flatMap((day) =>
    weekly(`cs-${day}`, 'CS 1301 class', 'class', day, 13, 0, 13, 50, 'Clough 144'),
  ),
]

const WORK_BLOCKS_3 = [9, 12].flatMap((day) =>
  weekly(`shift-${day}`, 'Work shift', 'work', day, 14, 0, 18, 0, 'Campus Recreation Center'),
)

const CLASS_BLOCKS_3 = [9, 11, 13].flatMap((day) =>
  weekly(`phys-${day}`, 'PHYS 2211 class', 'class', day, 11, 0, 11, 50, 'Howey L1'),
)

export const SCENARIO_2_IMPORT = [
  canvasTask('chem-prep', 'CHEM 1310 Lab Prep', at(10, 9, 0), 45),
  canvasTask('math-hw9', 'MATH 1554 Homework 9', at(11, 23, 59), 90),
  canvasTask('engl-draft', 'ENGL 1102 Essay Draft', at(12, 17, 0), 120),
  canvasTask('cs-hw7', 'CS 1301 Homework 7', at(13, 17, 0), 90),
]

export const SCENARIO_2_BLOCKS = CLASS_BLOCKS_2

export const SCENARIOS = {
  1: {
    id: '1',
    name: 'Tonight\'s deadlines',
    summary: 'Several deadlines are due tonight, and a quiz is missing from the app.',
    needsConnect: false,
    tasks: () => [
      canvasTask('phys-lab', 'PHYS 2212 Lab Report 7', at(8, 23, 59), 135, 10),
      canvasTask('cs-hw6', 'CS 1332 Homework 6', at(8, 23, 59), 75, 4),
      canvasTask('inta-resp', 'INTA 1200 Reading Response', at(8, 23, 59), 35, 2),
      canvasTask('econ-post', 'ECON 2100 Discussion Post', at(8, 23, 59), 25, 1),
    ],
    blocks: () => [],
  },
  2: {
    id: '2',
    name: 'First-time setup and a wrong date',
    summary: 'A first-year student connects Canvas and Google Calendar, then fixes a date.',
    needsConnect: true,
    tasks: () => [],
    blocks: () => [],
  },
  3: {
    id: '3',
    name: 'Balancing the week',
    summary: 'A club member with a job checks where the whole week stands.',
    needsConnect: false,
    tasks: () => [
      task('motor-parts', 'Order motor parts', 'Clubs', at(8, 22, 0), 30),
      canvasTask('phys-reading', 'PHYS 2211 Reading', at(9, 10, 0), 60),
      task('gym', 'Gym session', 'Health', at(9, 20, 0), 60),
      task('budget', 'Update robotics budget sheet', 'Clubs', at(14, 17, 0), 45),
      task('tools', 'Reserve workshop tools', 'Clubs', at(6, 17, 0), 30, { done: true }),
      task('notes', 'Send meeting notes', 'Clubs', at(7, 12, 0), 15, { done: true }),
      canvasTask('phys-ps8', 'PHYS 2211 Problem Set 8', at(18, 23, 59), 90),
      task('resume', 'Update resume', 'Personal goals', at(28, 17, 0), 60),
    ],
    blocks: () => [...WORK_BLOCKS_3, ...CLASS_BLOCKS_3],
  },
}
