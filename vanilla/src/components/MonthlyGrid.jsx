// components/MonthlyGrid.jsx
import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import EachDate from "./EachDate"

/*
  MonthlyGrid:
  - Renders the grid of visibleDates computed by the CalendarContext.
  - Keeps rendering simple; responsibility is layout only.
*/
export default function MonthlyGrid() {
  const {
    ui: { visibleDates },
  } = useCalendar()

  return (
    <div className='month-container'>
      {visibleDates.map((date, index) => (
        // EachDate is responsible for fetching and rendering events for its date
        <EachDate key={date.toDateString()} date={date} index={index} />
      ))}
    </div>
  )
}
