import React from "react"
import { format } from "date-fns"
import { CalendarProvider } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"

import { DateCell } from "../untypedComponents/UntypedDateCell"
import { AddEventModal } from "../untypedComponents/UntypedEventModals"
import { EditEventModal } from "../untypedComponents/UntypedEventModals"

export function Calendar() {
  return (
    <CalendarProvider>
      <div className='calendar'>
        <Nav />
        <MonthlyGrid />
        <AddEventModal />
        <EditEventModal />
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
      {visibleDates.map((date, index) => (
        <DateCell key={date.toDateString()} date={date} index={index} />
      ))}
    </div>
  )
}
