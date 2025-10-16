import React, { useMemo } from "react"
import { format, isSameMonth, isToday, isPast } from "date-fns"
import { useCalendar } from "../../contexts/CalendarContext"
import EventCell from "../../oldVersions/untypedComponents/UntypedEventCell"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import "./dateCell.css"

interface DateCellProps {
  date: Date
  index: number
}

export function TypedDateCell({ date, index }: DateCellProps) {
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

  const openModalForDate = () => {
    setSelectedEventDate(date)
    setShowEventModule(true)
  }

  return (
    <div className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}`}>
      <button onClick={openModalForDate} className='add-event-btn'>
        +
      </button>

      <div className='date-header'>
        {row === 0 && <div className='weekday-label'>{weekdayLabels[col]}</div>}
        <div
          className={`date-num ${isToday(date) ? "today" : ""} ${
            isPast(date) && !isToday(date) ? "prev-day" : ""
          }`}>
          {date.getDate()}
        </div>
      </div>

      <div className='events-list'>
        {sortedEvents.map((event, i) => (
          <EventCell key={i} event={event} index={i} date={date} />
        ))}
      </div>
    </div>
  )
}
