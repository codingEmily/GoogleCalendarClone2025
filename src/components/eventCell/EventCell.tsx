import type { MouseEvent } from "react"
import { isPast, isToday } from "date-fns"
import { to12HourFormat, useCalendar } from "../../contexts/CalendarContext"
import type { CalendarEventWithId } from "../../contexts/CalendarContext"
import "./eventCell.css"

interface EventCellProps {
  event: CalendarEventWithId
  index: number
  date: Date
}

export default function EventCell({ event, index, date }: EventCellProps) {
  const {
    ui: { setShowEditEventModal, setSelectedEventDate, setSelectedEventId, setShowOverflowModal },
  } = useCalendar()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setSelectedEventDate(date)
    setSelectedEventId(event.eventId)
    setShowEditEventModal(true)
    setShowOverflowModal(false)
  }

  return (
    <>
      <button
        className={`calendar-event  ${
          event.eventForm.eventAllDay ? "allday-event" : "timed-event"
        } ${event.eventForm.eventColor}-event 
        ${isPast(date) && !isToday(date) ? "prev-day-overlay" : ""} `}
        onClick={handleClick}
        title={event.eventForm.eventName}>
        {event.eventForm.eventAllDay ? (
          <span className='event-name'>{event.eventForm.eventName}</span>
        ) : (
          <>
            <span className='event-dot'>●</span>
            <span className='event-time'>
              {event.eventForm.eventStartTime != null &&
                `${to12HourFormat(event.eventForm.eventStartTime)}`}
            </span>
            <span className='event-name'>{event.eventForm.eventName}</span>
          </>
        )}
      </button>
    </>
  )
}
