// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { describe, expect, it } from 'vitest'
import { QUIZ, SCENARIOS, SCENARIO_2_BLOCKS, SCENARIO_2_IMPORT } from '../data/scenarios.js'
import { overloadLine, priorityLabels, rank, spareTime, whyFirst } from './rank.js'
import { at, finishTime, freeMinutes, parseDuration } from './time.js'

const NOW = at(8, 19, 0)
const titles = (list) => list.map((t) => t.title)
const quiz = { ...QUIZ, id: 'quiz', cell: 'Classes', done: false }
const s1 = () => SCENARIOS[1].tasks()
const mk = (id, due, effort, pct = null) => ({ id, title: id, cell: 'Classes', due, effort, pct })

describe('Scenario 1', () => {
  it('before the quiz: the lab report is first and nothing is under the line', () => {
    const r = rank(s1(), NOW)
    expect(r.order[0].title).toBe('PHYS 2212 Lab Report 7')
    expect(r.below).toEqual([])
    expect(overloadLine(s1(), NOW)).toBeNull()
  })

  it('after adding it: quiz first with 1h 15m spare, lab second, ECON under the line', () => {
    const tasks = [...s1(), quiz]
    const r = rank(tasks, NOW)
    expect(r.order[0].title).toBe('HIST 2111 Reading Quiz')
    expect(spareTime(r.order[0], NOW)).toBe(75)
    expect(r.order[1].title).toBe('PHYS 2212 Lab Report 7')
    expect(titles(r.below)).toEqual(['ECON 2100 Discussion Post'])
    expect(overloadLine(tasks, NOW)).toMatchObject({ work: 315, left: 299 })
  })

  it('labels after adding it: High, High, Medium, Low', () => {
    const r = rank([...s1(), quiz], NOW)
    expect(priorityLabels(r.order.length)).toEqual(['High', 'High', 'Medium', 'Low'])
  })

  it('marking the quiz done at 7:45 PM keeps the lab first and ECON under the line', () => {
    const later = at(8, 19, 45)
    const tasks = [...s1(), { ...quiz, done: true }]
    const r = rank(tasks, later)
    expect(r.order[0].title).toBe('PHYS 2212 Lab Report 7')
    expect(titles(r.below)).toEqual(['ECON 2100 Discussion Post'])
    expect(overloadLine(tasks, later)).toMatchObject({ work: 270, left: 254 })
  })

  it('keeps ECON the cheapest task, at 16 minutes or more', () => {
    const tasks = [...s1(), quiz]
    const econ = tasks.find((t) => t.title.startsWith('ECON'))
    expect(econ.effort).toBeGreaterThanOrEqual(16)
    expect(Math.min(...tasks.map((t) => t.pct))).toBe(econ.pct)
  })
})

describe('Scenario 2', () => {
  const order = (tasks) => titles(rank(tasks, NOW, SCENARIO_2_BLOCKS).order)

  it('moves Homework 9 from second to fourth, and back', () => {
    const tasks = SCENARIO_2_IMPORT.map((t) => ({ ...t }))
    expect(order(tasks)[1]).toBe('MATH 1554 Homework 9')
    const moved = tasks.map((t) => (t.id === 'math-hw9' ? { ...t, due: at(13, 23, 59) } : t))
    expect(order(moved)[3]).toBe('MATH 1554 Homework 9')
    expect(order(tasks)[1]).toBe('MATH 1554 Homework 9')
  })
})

describe('Scenario 3', () => {
  it('shows Order motor parts ahead of the PHYS reading', () => {
    const r = rank(SCENARIOS[3].tasks(), NOW, SCENARIOS[3].blocks())
    expect(titles(r.order).slice(0, 2)).toEqual(['Order motor parts', 'PHYS 2211 Reading'])
    expect(r.below).toEqual([])
    const [card] = r.order
    expect(whyFirst(card, r, NOW, SCENARIOS[3].blocks())[0]).toContain('least spare time')
  })

  it('leaves undated tasks out of the ranking', () => {
    const tasks = [...SCENARIOS[3].tasks(), mk('undated', null, 60)]
    expect(titles(rank(tasks, NOW).order)).not.toContain('undated')
  })

  it('counts the work shift against the gym session', () => {
    const gym = SCENARIOS[3].tasks().find((t) => t.id === 'gym')
    const shift = SCENARIOS[3].blocks().filter((b) => b.title === 'Work shift')
    expect(spareTime(gym, NOW, shift)).toBe(spareTime(gym, NOW) - 240)
  })
})

describe('ranking edge cases at 7:00 PM', () => {
  it('a 1% post and a 20% project: the project ranks and the post goes under the line', () => {
    const r = rank([mk('post', at(8, 19, 30), 25, 1), mk('project', at(8, 22, 0), 170, 20)], NOW)
    expect(titles(r.order)).toEqual(['project'])
    expect(titles(r.below)).toEqual(['post'])
  })

  it('when spare-time order would make a task late, deadline order wins', () => {
    const r = rank([mk('post', at(8, 19, 30), 10, 1), mk('project', at(8, 20, 40), 85, 20)], NOW)
    expect(titles(r.order)).toEqual(['post', 'project'])
    expect(r.below).toEqual([])
    expect(r.deadlineOrder).toBe(true)
  })

  it('only a task up to the first late one can move', () => {
    const r = rank(
      [
        mk('five', at(8, 21, 0), 90, 5),
        mk('eight', at(8, 21, 0), 60, 8),
        mk('cheap', at(15, 21, 0), 30, 1),
      ],
      NOW,
    )
    expect(titles(r.below)).toEqual(['five'])
    expect(titles(r.order)).toContain('cheap')
  })

  it('tasks with no % never move, and the list reports the overload', () => {
    const r = rank([mk('a', at(8, 20, 0), 45), mk('b', at(8, 20, 0), 45)], NOW)
    expect(r.below).toEqual([])
    expect(r.overload).toBe(true)
    expect(r.order).toHaveLength(2)
  })
})

describe('fixed blocks', () => {
  const blocks = [{ start: at(8, 20, 0), end: at(8, 21, 0) }]

  it('free time leaves blocks out', () => {
    expect(freeMinutes(NOW, at(8, 22, 0), blocks)).toBe(120)
    expect(freeMinutes(at(8, 20, 30), at(8, 22, 0), blocks)).toBe(60)
    expect(freeMinutes(at(8, 22, 0), NOW, blocks)).toBe(0)
  })

  it('finish time skips over blocks', () => {
    expect(finishTime(NOW, 30, blocks)).toBe(at(8, 19, 30))
    expect(finishTime(NOW, 90, blocks)).toBe(at(8, 21, 30))
    expect(finishTime(at(8, 20, 30), 10, blocks)).toBe(at(8, 21, 10))
  })

  it('a task that a block pushes past its deadline goes under the line', () => {
    const r = rank([mk('t', at(8, 21, 0), 90, 5)], NOW, blocks)
    expect(titles(r.below)).toEqual(['t'])
  })

  it('handles overlapping blocks', () => {
    const overlap = [
      { start: at(8, 20, 0), end: at(8, 21, 0) },
      { start: at(8, 20, 30), end: at(8, 21, 30) },
    ]
    expect(freeMinutes(NOW, at(8, 22, 0), overlap)).toBe(90)
    expect(finishTime(NOW, 90, overlap)).toBe(at(8, 22, 0))
  })
})

describe('parseDuration', () => {
  it.each([
    ['45', 45],
    ['45m', 45],
    ['1h', 60],
    ['1h 30m', 90],
    ['1.5h', 90],
    ['2 hours', 120],
    ['45 minutes', 45],
  ])('reads %s', (text, minutes) => expect(parseDuration(text)).toBe(minutes))

  it.each(['', 'soon', '0', '-5'])('rejects %s', (text) => expect(parseDuration(text)).toBeNull())
})
