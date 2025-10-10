// components/Nav.jsx
import React from "react"
import { format } from "date-fns"
import { useCalendar } from "../contexts/CalendarContext"

/*
  Nav: month navigation controls.
  - Uses ui.* values from the unified CalendarContext.
  - Minimal changes from your original markup; logic moved to context.
*/
export default function Nav() {
  const {
    ui: { visibleMonth, setVisibleMonth, showPreviousMonth, showNextMonth },
  } = useCalendar()

  return (
    <div className='calendar-nav'>
      {/* Jump to today's month */}
      <button onClick={() => setVisibleMonth(new Date())}>Today</button>

      {/* Previous / Next */}
      <button className='nav-arrow-button' onClick={showPreviousMonth}>
        {"<"}
      </button>
      <button className='nav-arrow-button' onClick={showNextMonth}>
        {">"}
      </button>

      {/* Month header */}
      <span className='month-header'>{format(visibleMonth, "MMMM yyyy")}</span>
    </div>
  )
}
