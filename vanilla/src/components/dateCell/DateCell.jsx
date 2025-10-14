import React, { useMemo } from "react"
import { format, isSameMonth, isToday, isPast } from "date-fns"
import { useCalendar } from "../../contexts/CalendarContext"
import EventCell from "../eventCell/EventCell" // expects (event, onClick) or adapt as needed
import "./dateCell.css"
/*
  EachDate:
  - Responsible for one calendar cell.
  - Fetches events for this date via eventsAPI.getEventsForDate (from context).
  - Sorts events here (sorting logic kept close to UI; rendering of one event delegated to EachEventDisplay).
  - Uses ui actions (setShowEventModule, setSelectedEventDate) from context to open modal.
*/

export function DateCell({ date, index }) {
  const {
    ui: {
      visibleMonth,
      setShowEventModule,
      setShowEditEventModule,
      setSelectedEventIndex,
      setSelectedEventDate,
    },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  // row/col used for weekday labels (kept from original)
  const row = Math.floor(index / 7)
  const col = index % 7
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // --- Get and sort events for this date ---
  const events = getEventsForDate(date) || []

  // keep sorting logic local to EachDate (presentation concern)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      // same rules as original: allday first, then by start time
      if (a.eventAllday && !b.eventAllday) return -1
      if (!a.eventAllday && b.eventAllday) return 1
      if (a.eventAllday && b.eventAllday) return 0
      // guard: eventTimes may be null for allday events
      const aStart = a.eventTimes?.start ?? ""
      const bStart = b.eventTimes?.start ?? ""
      return aStart.localeCompare(bStart)
    })
  }, [events])

  // handler to open the modal and set the selected date
  const openModalForDate = () => {
    setSelectedEventDate(date)
    setShowEventModule(true)
  }

  return (
    <div className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}`}>
      {/* add event button (keeps same behavior) */}
      <button onClick={openModalForDate} className='add-event-btn'>
        +
      </button>

      <div className='date-header'>
        {/* weekday label only on first row */}
        {row === 0 && <div className='weekday-label'>{weekdayLabels[col]} </div>}
        <div
          className={`date-num ${isToday(date) ? "today" : ""} ${
            isPast(date) && !isToday(date) ? "prev-day" : ""
          }`}>
          {date.getDate()}
        </div>
      </div>

      {/* --- Events display: EachEventDisplay renders a single event */}
      <div className='events-list'>
        {sortedEvents.map((event, i) => (
          // EachEventDisplay is a tiny presentational component.
          // It should accept an onClick (we pass a handler that opens modal and sets date).
          <EventCell
            key={i}
            event={event}
            index={i}
            date={date}
            onClick={() => {
              // open modal and ensure selected date is this date
              setSelectedEventDate(date)
              setShowEditEventModule(true)
            }}
          />
        ))}
      </div>
    </div>
  )
}
