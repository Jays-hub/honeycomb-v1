// Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.
// The scripted run of all three scenarios through the UI, which the AI log cites as a mitigation.
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'

const user = userEvent.setup()
const button = (name) => screen.getByRole('button', { name })
const click = (name) => user.click(button(name))
const link = (name) => screen.getByRole('link', { name })
const clickLink = (name) => user.click(link(name))
const card = () => screen.getByRole('heading', { name: 'Do this next' }).closest('section')
const cardText = () => card().textContent
const banner = () => document.querySelector('.banner-clock').textContent
const rowOf = (title) => screen.getAllByRole('link', { name: title })[0].closest('li')
const listTitles = () => [...document.querySelectorAll('ol.rows .row-title')].map((a) => a.textContent)

async function start(id) {
  window.location.hash = '#/'
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  )
  await clickLink(new RegExp(`Scenario ${id}$`))
  await click('Log in or create account')
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(cleanup)

async function addQuiz() {
  await clickLink('Add task')
  await user.type(screen.getByLabelText('Title'), 'HIST 2111 Reading Quiz')
  await user.click(screen.getByText('More details'))
  await click('Tonight')
  await user.clear(screen.getByLabelText('Time'))
  await user.type(screen.getByLabelText('Time'), '21:00')
  await user.type(screen.getByLabelText('Expected time'), '45m')
  await user.type(screen.getByLabelText(/% of course grade/), '3')
  await click('Save task')
}

describe('Scenario 1', () => {
  it('runs from logging in to skipping, with undo', async () => {
    await start(1)
    expect(cardText()).toContain('PHYS 2212 Lab Report 7')
    expect(screen.queryByText("Won't fit in time")).toBeNull()

    await addQuiz()
    expect(cardText()).toContain('HIST 2111 Reading Quiz')
    expect(screen.getByText(/5h 15m of work and 4h 59m left/)).toBeTruthy()
    expect(screen.getByRole('heading', { name: "Won't fit in time" })).toBeTruthy()
    expect(within(rowOf('ECON 2100 Discussion Post')).getByText('Low')).toBeTruthy()
    expect(listTitles().slice(0, 2)).toEqual(['HIST 2111 Reading Quiz', 'PHYS 2212 Lab Report 7'])
    const labels = [...document.querySelectorAll('ol.rows .priority')].map((el) => el.textContent)
    expect(labels).toEqual(['High', 'High', 'Medium', 'Low'])

    await clickLink('Why this first')
    expect(screen.getByText(/least spare time: 1h 15m free/)).toBeTruthy()
    await clickLink('Back to Home')

    await user.click(within(card()).getByRole('button', { name: 'Mark done' }))
    expect(banner()).toContain('7:45 PM')
    expect(cardText()).toContain('PHYS 2212 Lab Report 7')
    expect(screen.getByText(/4h 30m of work and 4h 14m left/)).toBeTruthy()
    expect(rowOf('ECON 2100 Discussion Post')).toBeTruthy()

    await click('Undo')
    expect(banner()).toContain('7:00 PM')
    expect(cardText()).toContain('HIST 2111 Reading Quiz')

    await user.click(within(card()).getByRole('button', { name: 'Mark done' }))
    await click('Not now')
    expect(cardText()).toContain('CS 1332 Homework 6')
    expect(within(rowOf('PHYS 2212 Lab Report 7')).getByText('Skipped')).toBeTruthy()
    await click('Undo skip')
    expect(cardText()).toContain('PHYS 2212 Lab Report 7')
  })

  it('keeps data through a remount, and Reset demo clears it', async () => {
    await start(1)
    await addQuiz()
    cleanup()
    render(
      <HashRouter>
        <App />
      </HashRouter>,
    )
    expect(cardText()).toContain('HIST 2111 Reading Quiz')
    await click('Reset demo')
    await click('Log in or create account')
    expect(cardText()).toContain('PHYS 2212 Lab Report 7')
  })

  it('shows red errors that say how to fix them, and Esc leaves the form', async () => {
    await start(1)
    await clickLink('Add task')
    await click('Save task')
    expect(screen.getByRole('alert').textContent).toContain('Enter a title')
    await user.type(screen.getByLabelText('Title'), 'Old task')
    await user.click(screen.getByText('More details'))
    await click('Tonight')
    await user.clear(screen.getByLabelText('Time'))
    await user.type(screen.getByLabelText('Time'), '18:00')
    await click('Save task')
    expect(screen.getByRole('alert').textContent).toContain('That time has passed')
    await user.keyboard('{Escape}')
    expect(cardText()).toContain('PHYS 2212 Lab Report 7')
    expect(screen.queryByText('Old task')).toBeNull()
  })

  it('toggles the password and blocks an empty login', async () => {
    window.location.hash = '#/1/login'
    render(
      <HashRouter>
        <App />
      </HashRouter>,
    )
    const field = screen.getByLabelText('Password')
    expect(field.type).toBe('password')
    await click('Show password')
    expect(field.type).toBe('text')
    await user.clear(field)
    await click('Log in or create account')
    expect(screen.getByRole('alert').textContent).toContain('Enter an email and a password')
  })
})

describe('Confirmations and history', () => {
  it('clears a confirmation on leaving its screen, but carries a new one back from the form', async () => {
    await start(1)
    await addQuiz()
    expect(screen.getByText(/Added HIST 2111 Reading Quiz/)).toBeTruthy()
    await clickLink('Week')
    expect(screen.queryByText(/Added HIST 2111 Reading Quiz/)).toBeNull()
  })

  it('does not let an old Undo remove imported Canvas tasks', async () => {
    await start(2)
    await clickLink('Go to Home')
    await clickLink('Add task')
    await user.type(screen.getByLabelText('Title'), 'Pack bag')
    await click('Save task')
    expect(button('Undo')).toBeTruthy()
    await clickLink('Connect Canvas and Google Calendar')
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    await click('Use sample link')
    await click('Connect Canvas')
    await clickLink('Go to Home')
    expect(listTitles()).toContain('MATH 1554 Homework 9')
  })

  it('shows Demo reset. on login only, and offers Start again on the menu', async () => {
    await start(1)
    await click('Reset demo')
    expect(screen.getByText('Demo reset.')).toBeTruthy()
    await clickLink('Switch scenario')
    expect(link('Start Scenario 1')).toBeTruthy()
    await clickLink('Start Scenario 1')
    await click('Log in or create account')
    expect(screen.queryByText('Demo reset.')).toBeNull()
  })

  it('goes from Home back to the menu in one press', async () => {
    await start(1)
    window.history.back()
    expect(await screen.findByRole('heading', { name: 'Prototype menu' })).toBeTruthy()
  })

  it('removes a due date by choosing No due date alone', async () => {
    await start(1)
    await clickLink('PHYS 2212 Lab Report 7')
    await user.selectOptions(screen.getByLabelText('Day'), 'No due date')
    expect(screen.getByLabelText('Time').value).toBe('')
    await click('Save task')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('heading', { name: /No due date/ })).toBeTruthy()
  })
})

describe('Scenario 2', () => {
  it('connects both feeds, corrects the date and restores it', async () => {
    await start(2)
    await click('Connect Canvas')
    expect(screen.getByRole('alert').textContent).toContain('Use sample link')
    await user.type(screen.getByLabelText('Canvas calendar feed link'), 'not a link')
    await click('Connect Canvas')
    expect(screen.getByRole('alert').textContent).toContain('not the sample feed link')
    await click('Use sample link')
    await click('Connect Canvas')
    expect(screen.getByText(/4 deadlines imported/)).toBeTruthy()

    await click('Connect Google Calendar')
    await click('Cancel')
    await click('Connect Google Calendar')
    await click('Allow')
    await clickLink('Go to Home')

    expect(listTitles()[1]).toBe('MATH 1554 Homework 9')
    expect(within(rowOf('MATH 1554 Homework 9')).getByText('From Canvas')).toBeTruthy()
    expect(within(rowOf('MATH 1554 Homework 9')).getByText('Not set')).toBeTruthy()

    await clickLink('MATH 1554 Homework 9')
    await user.selectOptions(screen.getByLabelText('Day'), 'Fri, Nov 13')
    await click('Save task')
    expect(listTitles()[3]).toBe('MATH 1554 Homework 9')
    const row = rowOf('MATH 1554 Homework 9')
    expect(row.textContent).toContain('Fri, Nov 13, 11:59 PM')
    expect(within(row).getByText('Changed by you')).toBeTruthy()
    expect(screen.getByText(/moved from 2nd to 4th/)).toBeTruthy()

    await user.click(within(row).getByRole('button', { name: 'Restore Canvas date' }))
    expect(listTitles()[1]).toBe('MATH 1554 Homework 9')
    expect(rowOf('MATH 1554 Homework 9').textContent).toContain('Wed, Nov 11, 11:59 PM')
  })

  it('rejects a date before the demo time in red', async () => {
    await start(2)
    await click('Use sample link')
    await click('Connect Canvas')
    await clickLink('Go to Home')
    await clickLink('MATH 1554 Homework 9')
    await user.selectOptions(screen.getByLabelText('Day'), 'Sun, Nov 8')
    await user.clear(screen.getByLabelText('Time'))
    await user.type(screen.getByLabelText('Time'), '08:00')
    await click('Save task')
    expect(screen.getByRole('alert').textContent).toContain('That time has passed')
  })
})

describe('Scenario 3', () => {
  it('shows the week, ranks club work first and counts Clubs progress', async () => {
    await start(3)
    await clickLink('Week')
    const monday = screen.getByRole('heading', { name: 'Mon, Nov 9' }).closest('li')
    expect(monday.textContent).toContain('2:00 PM to 6:00 PM')
    expect(monday.textContent).toContain('Work shift, Campus Recreation Center')
    await click('Next week')
    expect(screen.getByRole('heading', { name: 'Sun, Nov 15' })).toBeTruthy()
    expect(link('PHYS 2211 Problem Set 8')).toBeTruthy()
    await click('Week after')
    expect(link('Update resume')).toBeTruthy()

    await clickLink('Home')
    expect(cardText()).toContain('Order motor parts')
    expect(listTitles().slice(0, 2)).toEqual(['Order motor parts', 'PHYS 2211 Reading'])

    await clickLink('Why this first')
    expect(screen.getByText(/has the least spare time/)).toBeTruthy()

    await clickLink('Cells')
    expect(link(/Clubs.*2 of 4 done/)).toBeTruthy()

    await clickLink('Home')
    await clickLink('Add task')
    await user.type(screen.getByLabelText('Title'), 'Book room for robotics meeting')
    await user.selectOptions(screen.getByLabelText('Cell'), 'Clubs')
    await click('Save task')
    expect(screen.getByRole('heading', { name: 'No due date' })).toBeTruthy()
    const row = rowOf('Book room for robotics meeting')
    expect(row.textContent).toContain('Add a due date to rank this.')
    expect(row.querySelector('.priority')).toBeNull()

    await clickLink('Cells')
    expect(link(/Clubs.*2 of 5 done/)).toBeTruthy()

    await clickLink('Home')
    await user.click(within(card()).getByRole('button', { name: 'Mark done' }))
    await clickLink('Cells')
    expect(link(/Clubs.*3 of 5 done/)).toBeTruthy()

    await clickLink(/Clubs.*3 of 5 done/)
    expect(screen.getByRole('heading', { name: 'Clubs' })).toBeTruthy()
    expect(screen.getByText('3 of 5 done')).toBeTruthy()
    expect(screen.getByText('Book room for robotics meeting')).toBeTruthy()
    await clickLink('Back to Cells')
  })
})
