// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { SAMPLE_FEED_LINK, SCENARIO_2_IMPORT } from '../data/scenarios.js'
import { useScenario } from '../lib/ScenarioContext.js'
import { connectCanvas, connectGoogle } from '../lib/store.js'
import { useEscape } from '../lib/useEscape.js'

export default function Connect() {
  const [state, update] = useScenario()
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [asking, setAsking] = useState(false)
  const closeCard = useCallback(() => setAsking(false), [])
  useEscape(closeCard)

  const submitCanvas = (event) => {
    event.preventDefault()
    if (link.trim() === SAMPLE_FEED_LINK) {
      setError('')
      update(connectCanvas)
    } else if (!link.trim()) {
      setError('Enter your feed link, or choose "Use sample link".')
    } else {
      setError(
        'That is not the sample feed link. This prototype has no real Canvas connection, so choose "Use sample link".',
      )
    }
  }

  return (
    <div className="narrow">
      <h1>Connect your calendars</h1>
      <p>Honeycomb reads your deadlines from Canvas and your classes from Google Calendar.</p>

      <section className="panel">
        <h2>Canvas</h2>
        {state.canvas ? (
          <p className="success" role="status">
            Canvas is connected. {SCENARIO_2_IMPORT.length} deadlines imported.
          </p>
        ) : (
          <form onSubmit={submitCanvas} noValidate>
            <div className="field">
              <label htmlFor="feed">Canvas calendar feed link</label>
              <input
                id="feed"
                type="url"
                value={link}
                aria-invalid={Boolean(error)}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <button type="button" className="btn" onClick={() => { setLink(SAMPLE_FEED_LINK); setError('') }}>
                Use sample link
              </button>
              <button type="submit" className="btn btn-primary">
                Connect Canvas
              </button>
            </div>
            <details>
              <summary>Where do I find my Canvas feed link?</summary>
              <p>
                In Canvas, open Calendar and choose Calendar Feed at the bottom of the side panel. For
                this prototype, use the sample link instead of your own.
              </p>
            </details>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>Google Calendar</h2>
        {state.google && (
          <p className="success" role="status">
            Google Calendar is connected. Your class times are on your week.
          </p>
        )}
        {!state.google && !asking && (
          <button type="button" className="btn btn-primary" onClick={() => setAsking(true)}>
            Connect Google Calendar
          </button>
        )}
        {!state.google && asking && (
          <div className="sim-card">
            <h3>Allow Honeycomb to read your calendar?</h3>
            <p>This step is simulated with sample classes. No Google account is used.</p>
            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { update(connectGoogle); setAsking(false) }}
              >
                Allow
              </button>
              <button type="button" className="btn" onClick={closeCard}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <Link className={state.canvas && state.google ? 'btn btn-primary btn-wide' : 'btn btn-wide'} to={`/${state.id}/home`}>
        Go to Home
      </Link>
    </div>
  )
}
