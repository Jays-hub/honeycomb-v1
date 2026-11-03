// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useScenario } from '../lib/ScenarioContext.js'
import { homePathAfterLogin, logIn } from '../lib/store.js'

function EyeIcon({ crossed }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 4l16 16" />}
    </svg>
  )
}

export default function Login() {
  const [state, update] = useScenario()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@honeycomb.example')
  const [password, setPassword] = useState('sample-demo-pass')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  if (state.loggedIn) return <Navigate to={homePathAfterLogin(state)} replace />

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter an email and a password. The demo details work if you reset this demo.')
      return
    }
    update(logIn)
    navigate(homePathAfterLogin(state), { replace: true })
  }

  return (
    <div className="narrow login">
      <h1>Log in</h1>
      <p className="note">The details below are filled in for this demo. Do not use a real password.</p>
      <form onSubmit={submit} noValidate>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="with-button">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(!show)}
            >
              <EyeIcon crossed={show} />
            </button>
          </div>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-wide">
          Log in or create account
        </button>
      </form>
    </div>
  )
}
