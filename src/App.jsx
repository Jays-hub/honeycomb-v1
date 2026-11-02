// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
import { Link, Route, Routes } from 'react-router'

function Logo() {
  return (
    <svg className="logo" viewBox="0 0 48 54" role="img" aria-label="Honeycomb logo">
      <polygon points="24,1 47,14 47,40 24,53 1,40 1,14" fill="#1D2330" />
      <polygon points="1,31 47,31 47,40 24,53 1,40" fill="#F5B301" />
    </svg>
  )
}

function PrototypeMenu() {
  return (
    <>
      <h1>Honeycomb prototype</h1>
      <p>Prototype V1 is being built here. The three task scenarios will start from this page.</p>
      <p>This prototype uses sample data. Do not enter real links or passwords.</p>
    </>
  )
}

function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the prototype menu</Link>
      </p>
    </>
  )
}

export default function App() {
  return (
    <main>
      <Logo />
      <Routes>
        <Route path="/" element={<PrototypeMenu />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer>Team A17, CS 3803. Built with Claude Code (Claude Opus 5.5).</footer>
    </main>
  )
}
