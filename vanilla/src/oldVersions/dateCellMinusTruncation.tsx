// WORKING DATECELL WITHOUT TRUNCATION

import { format, isSameMonth, isToday, isPast } from "date-fns"
import { useMemo } from "react"
import { useCalendar } from "../contexts/CalendarContext"
import EventCell from "../components/eventCell/EventCell"
import type { CalendarEvent } from "../contexts/CalendarContext"
import "./dateCell.css"

interface DateCellProps {
  date: Date
  index: number
}

export function DateCell({ date, index }: DateCellProps) {
  const {
    ui: {
      visibleMonth,
      setShowEventModal,
      setShowEditEventModal,
      setSelectedEventIndex,
      setSelectedEventDate,
    },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  const row = Math.floor(index / 7)
  const col = index % 7
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  const events: CalendarEvent[] = getEventsForDate(date) || []

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.eventAllDay && !b.eventAllDay) return -1
      if (!a.eventAllDay && b.eventAllDay) return 1
      if (a.eventAllDay && b.eventAllDay) return 0

      const aStart = a.eventTimes?.start ?? ""
      const bStart = b.eventTimes?.start ?? ""
      return aStart.localeCompare(bStart)
    })
  }, [events])

  const openEventModalForDate = () => {
    setSelectedEventDate(date)
    setShowEventModal(true)
  }

  return (
    <>
      <div
        className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}
        ${isPast(date) && !isToday(date) ? "prev-day-overlay" : ""}`}>
        <button onClick={openEventModalForDate} className='add-event-btn'>
          +
        </button>

        <div className='date-header'>
          {row === 0 && <div className='weekday-label'>{weekdayLabels[col]}</div>}
          <div className={`date-num ${isToday(date) ? "today" : ""}`}>{date.getDate()}</div>
        </div>

        <div className='events-list'>
          {sortedEvents.map((event, i) => (
            <EventCell key={i} event={event} index={i} date={date} />
          ))}
        </div>
      </div>
    </>
  )
}
