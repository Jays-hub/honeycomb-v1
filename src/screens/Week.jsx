// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link, useLocation, useSearchParams } from 'react-router'
import { useScenario } from '../lib/ScenarioContext.js'
import { addDays, formatDay, formatTime, startOfDay, startOfWeek } from '../lib/time.js'

const TABS = ['This week', 'Next week', 'Week after']

export default function Week() {
  const [state] = useScenario()
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const tab = TABS[Number(params.get('w'))] ? Number(params.get('w')) : 0
  const start = addDays(startOfWeek(state.now), tab * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = startOfDay(state.now)

  return (
    <div className="week">
      <h1>Your week</h1>
      <div className="tabs" role="group" aria-label="Choose a week">
        {TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            className="tab"
            aria-pressed={i === tab}
            onClick={() => setParams({ w: String(i) })}
          >
            {label}
          </button>
        ))}
      </div>
      <ol className="days">
        {days.map((day) => {
          const blocks = state.blocks.filter((b) => startOfDay(b.start) === day)
          const tasks = state.tasks.filter((t) => t.due != null && startOfDay(t.due) === day)
          const items = [
            ...blocks.map((block) => ({ at: block.start, block })),
            ...tasks.map((task) => ({ at: task.due, task })),
          ].sort((a, b) => a.at - b.at)
          return (
            <li key={day} className={day === today ? 'day day-today' : 'day'}>
              <h2>
                {formatDay(day)}
                {day === today && <span className="tag tag-strong">Today</span>}
              </h2>
              {items.length === 0 && <p className="empty">Nothing scheduled</p>}
              <ul>
                {items.map(({ block, task }) =>
                  block ? (
                    <li key={block.id} className={`item item-${block.kind}`}>
                      <span className="item-when">
                        {formatTime(block.start)} to {formatTime(block.end)}
                      </span>
                      <span>
                        {block.title}, {block.place}
                      </span>
                    </li>
                  ) : (
                    <li key={task.id} className={task.done ? 'item item-task item-done' : 'item item-task'}>
                      <span className="item-when">Due {formatTime(task.due)}</span>
                      <span>
                        <Link to={`/${state.id}/task/${task.id}`} state={{ from: `${pathname}?w=${tab}` }}>
                          {task.title}
                        </Link>{' '}
                        <span className="tag">{task.done ? 'Done' : task.cell}</span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
