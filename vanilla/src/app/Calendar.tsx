import React from "react"
import { format } from "date-fns"
import { CalendarProvider, useCalendar } from "../contexts/CalendarContext"

import { TypedDateCell } from "../components/dateCell/DateCell"
import { TypedAddEventModal } from "../components/eventModals/EventModals"
import { TypedEditEventModal } from "../components/eventModals/EventModals"

export function Calendar() {
  return (
    <CalendarProvider>
      <div className='calendar'>
        <Nav />
        <MonthlyGrid />
        <TypedAddEventModal />
        <TypedEditEventModal />
      </div>
    </CalendarProvider>
  )
}

export function Nav() {
  const {
    ui: { visibleMonth, setVisibleMonth, showPreviousMonth, showNextMonth },
  } = useCalendar()

  return (
    <div className='calendar-nav'>
      <button onClick={() => setVisibleMonth(new Date())}>Today</button>

      <button className='nav-arrow-button' onClick={showPreviousMonth}>
        {"<"}
      </button>
      <button className='nav-arrow-button' onClick={showNextMonth}>
        {">"}
      </button>

      <span className='nav-month-header'>{format(visibleMonth, "MMMM yyyy")}</span>
    </div>
  )
}

export function MonthlyGrid() {
  const {
    ui: { visibleDates },
  } = useCalendar()

  return (
    <div className='month-container'>
      {visibleDates.map((date: Date, index: number) => (
        <TypedDateCell key={date.toDateString()} date={date} index={index} />
      ))}
    </div>
  )
}
