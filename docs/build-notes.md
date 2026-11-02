# Build notes

Generated with Claude Code (Claude Opus 5.5). This is the detail behind `plan.html`. The plan wins on
any conflict.

## Product

Honeycomb is a free, responsive web app for Georgia Tech undergraduates. It imports Canvas deadlines
through the calendar feed and Google Calendar, takes quick entries for everything else, sorts tasks
into cells (Classes, Clubs, Work, Health, Personal goals), and ranks it all into one "Do this next"
card. The plan chat is out of scope for V1.

## Ranking

The algorithm below was tested in Python without fixed blocks, on the sample data and on random
overloaded nights. Port it to JavaScript and test the fixed-block handling too.

```
rank(tasks, now):                       # dated tasks that aren't done
  keep  = sort tasks by (due ascending, effort descending)
  below = []
  overload = false
  repeat:
    i = first task in keep that finishes after its due, working through keep in order from now
    if none: stop
    candidates = keep[0..i] that have a known %
    if candidates is empty: overload = true; stop
    move the candidate with the lowest % (ties: longest effort) from keep to below
  order = sort keep by (spare ascending, % descending, cell order)
  if following order would make any task late:
    order = sort keep by (due ascending, effort descending)
  return order, below, overload
```

- **Spare time** is free minutes between now and due, outside fixed blocks, minus effort.
- **Finish time** skips over fixed blocks.
- **Only tasks up to the first late one can be moved.** A cheap task due next week is never flagged for
  tonight's overload.
- **"Not now"** doesn't change the ranking. The card moves to the next task, and the row shows "Skipped."
- **Undated tasks** stay out of ranking, in the "No due date" group, with no label.

**Overload line:** take the first late task before anything moves. Work is the effort of every task due
by its deadline. Time left is the free time until that deadline. Scenario 1 shows 5h 15m of work and
4h 59m left, then 4h 30m and 4h 14m after the quiz is done.

**Priority labels** for n ranked tasks: `high = ceil(n / 3)`, `medium = ceil((n - high) / 2)`, and the
rest are low. Anything under "Won't fit in time" is Low. Labels follow rank, never spare time.

**Demo clock:** it starts at Sunday, Nov 8, 2026, 7:00 PM. Marking a task done adds its effort to the
clock, and undo takes it back. Weeks start on Sunday.

## Sample data

All of it is fictional. Avoid details from the interview notes. Re-run the tests after any change.

### Scenario 1: all due Nov 8

| Task | Due | Effort | % |
|---|---|---|---|
| HIST 2111 Reading Quiz (the evaluator adds this) | 9:00 PM | 45m | 3 |
| PHYS 2212 Lab Report 7 | 11:59 PM | 2h 15m | 10 |
| CS 1332 Homework 6 | 11:59 PM | 1h 15m | 4 |
| INTA 1200 Reading Response | 11:59 PM | 35m | 2 |
| ECON 2100 Discussion Post | 11:59 PM | 25m | 1 |

### Scenario 2: imported, no %, effort tagged "Est."

| Task | Due | Effort |
|---|---|---|
| CHEM 1310 Lab Prep | Tue Nov 10, 9:00 AM | 45m |
| MATH 1554 Homework 9 | Wed Nov 11, 11:59 PM | 1h 30m |
| ENGL 1102 Essay Draft | Thu Nov 12, 5:00 PM | 2h |
| CS 1301 Homework 7 | Fri Nov 13, 5:00 PM | 1h 30m |

The correction moves Homework 9 to Fri Nov 13, 11:59 PM. Google Calendar supplies class blocks.

### Scenario 3

| Task | Cell | Due | Effort |
|---|---|---|---|
| Order motor parts | Clubs | Sun Nov 8, 10:00 PM | 30m |
| PHYS 2211 Reading | Classes | Mon Nov 9, 10:00 AM | 1h |
| Gym session | Health | Mon Nov 9, 8:00 PM | 1h |
| Update robotics budget sheet | Clubs | Sat Nov 14, 5:00 PM | 45m |

Clubs also has two tasks already done, which gives 2 of 4 done. The next work shift is Mon Nov 9,
2:00 to 6:00 PM, at the campus recreation center. It cuts into the gym session's free time.

## Required tests

**Scenario 1**
- Before the quiz: the lab report is first and nothing is under the line.
- After adding it: quiz first with 1h 15m spare, lab report second, ECON under "Won't fit in time."
- Labels after adding it: High, High, Medium, Low, and ECON is Low.
- Marking the quiz done: clock at 7:45 PM, lab report first, ECON still under the line.
- Undo restores the earlier state.
- Skipping the lab report: card shows CS 1332 Homework 6, and the lab report stays listed as "Skipped."
- ECON stays the cheapest task and takes at least 16 minutes. The night runs over by 16 minutes, so
  anything shorter makes the expected result false.

**Scenario 2**
- Homework 9 moves from second to fourth, and "Restore Canvas date" moves it back.
- A date before the demo time shows a red error.

**Scenario 3**
- The card shows "Order motor parts" ahead of the PHYS reading.
- A title-only task lands under "No due date."
- The Clubs count reads 2 of 4, then 2 of 5, then 3 of 5.

**Ranking edge cases at 7:00 PM**
- 1% post due 7:30 PM (25m) and 20% project due 10:00 PM (2h 50m): the project ranks and the post goes
  under the line.
- 1% post due 7:30 PM (10m) and 20% project due 8:40 PM (1h 25m): the post goes first and both finish.
- 5% task and 8% task due 9:00 PM (1h 30m and 1h) and a 1% task due next week: only the 5% task goes
  under the line.
- Two tasks with no % that can't both fit: nothing moves and the list shows the overload.

The plan also calls for a scripted run of all three scenarios through the UI. Its AI log cites that as
a mitigation, so it has to exist.

## Design tokens

| Token | Value | Use |
|---|---|---|
| Ink | `#1D2330` | Text, focus rings |
| Mute | `#5D6470` | Secondary text |
| Rule | `#DADDE3` | Borders |
| Shade | `#F1F2F4` | Surfaces |
| Honey | `#F5B301` | Fills only. It is 1.85:1 on white, so never use it for text or focus rings |
| Honey soft | `#FFF6DA` | Highlight backgrounds |
| Honey ink | `#7A5900` | Gold text, 6.45:1 on white |
| Alert | `#B42318` | Errors |

The logo is the hexagon in `src/App.jsx`.

## Lo-fi to V1

| Sketch | Becomes |
|---|---|
| `lo-fi/login.png` | Log in, keeping the show-password eye |
| `lo-fi/assignments.png` | Home rows. "Generate Recommendation" goes away because ranking is live |
| `lo-fi/add-assignment.png` | Add task. Six fields become title and cell, with the rest under "More details" |
| `lo-fi/recommendation.png` | Expected time and priority on Home's rows |
