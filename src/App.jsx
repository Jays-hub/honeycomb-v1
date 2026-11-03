// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import { SCENARIOS } from './data/scenarios.js'
import { ScenarioContext, useScenario } from './lib/ScenarioContext.js'
import { clear, dismissToast, homePathAfterLogin, initialState, load, save, undoLast } from './lib/store.js'
import { formatDateTime } from './lib/time.js'
import { CellDetail, CellsOverview } from './screens/Cells.jsx'
import Connect from './screens/Connect.jsx'
import Home from './screens/Home.jsx'
import Login from './screens/Login.jsx'
import Menu from './screens/Menu.jsx'
import { Logo } from './screens/shared.jsx'
import TaskForm from './screens/TaskForm.jsx'
import Week from './screens/Week.jsx'
import Why from './screens/Why.jsx'

function NotFound() {
  return (
    <main className="narrow">
      <Logo />
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the prototype menu</Link>
      </p>
    </main>
  )
}

function Toast() {
  const [state, update] = useScenario()
  const { toast } = state
  return (
    <div className="toast-region" role="status">
      {toast && (
        <div className="toast">
          <p>{toast.text}</p>
          <div className="toast-actions">
            {toast.undo && (
              <button type="button" className="btn btn-small btn-ink" onClick={() => update(undoLast)}>
                Undo
              </button>
            )}
            <button type="button" className="btn btn-small" onClick={() => update(dismissToast)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Shell({ onReset }) {
  const [state] = useScenario()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Each new screen starts at the top, with focus on its heading.
  useEffect(() => {
    window.scrollTo?.(0, 0)
    const heading = document.querySelector('h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [pathname])

  const reset = () => {
    onReset()
    navigate(`/${state.id}/login`)
  }

  const base = `/${state.id}`
  return (
    <>
      <div className="banner">
        <span className="banner-clock">Sample data. Demo time: {formatDateTime(state.now)}</span>
        <span className="banner-actions">
          <Link to="/">Switch scenario</Link>
          <button type="button" className="link-btn" onClick={reset}>
            Reset demo
          </button>
        </span>
      </div>
      <header className="top">
        <Link className="brand" to={state.loggedIn ? homePathAfterLogin(state) : `${base}/login`}>
          <Logo />
          <span>Honeycomb</span>
        </Link>
        {state.loggedIn && (
          <nav aria-label="Main">
            <NavLink to={`${base}/home`}>Home</NavLink>
            <NavLink to={`${base}/week`}>Week</NavLink>
            <NavLink to={`${base}/cells`}>Cells</NavLink>
          </nav>
        )}
      </header>
      <main>
        <Toast />
        <Outlet />
      </main>
      <footer className="app-footer">Team A17, CS 3803. Built with Claude Code (Claude Opus 5.5).</footer>
    </>
  )
}

/** Holds one scenario's state and keeps it in sessionStorage. */
function ScenarioRoute() {
  const { scenarioId } = useParams()
  if (!SCENARIOS[scenarioId]) return <NotFound />
  return <ScenarioProvider key={scenarioId} id={scenarioId} />
}

function ScenarioProvider({ id }) {
  const [state, setState] = useState(() => load(id))
  const update = useCallback((action, ...args) => setState((current) => action(current, ...args)), [])
  const reset = useCallback(() => {
    clear(id)
    setState({ ...initialState(id), toast: { text: 'Demo reset.', undo: null } })
  }, [id])

  useEffect(() => save(state), [state])

  return (
    <ScenarioContext.Provider value={[state, update]}>
      <Shell onReset={reset} />
    </ScenarioContext.Provider>
  )
}

function RequireLogin() {
  const [state] = useScenario()
  return state.loggedIn ? <Outlet /> : <Navigate to={`/${state.id}/login`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path=":scenarioId" element={<ScenarioRoute />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route element={<RequireLogin />}>
          <Route path="connect" element={<Connect />} />
          <Route path="home" element={<Home />} />
          <Route path="why" element={<Why />} />
          <Route path="add" element={<TaskForm />} />
          <Route path="task/:taskId" element={<TaskForm key="edit" />} />
          <Route path="week" element={<Week />} />
          <Route path="cells" element={<CellsOverview />} />
          <Route path="cells/:cell" element={<CellDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
