import type { MouseEvent } from "react"
import { useCalendar } from "../../contexts/CalendarContext"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import "./eventCell.css"
// import "vanilla/src/components/eventCell/eventCell.css"

interface EventCellProps {
  event: CalendarEvent
  index: number
  date: Date
}

export default function EventCell({ event, index, date }: EventCellProps) {
  const {
    ui: { setShowEditEventModal, setSelectedEventDate, setSelectedEventIndex },
  } = useCalendar()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setSelectedEventDate(date)
    setSelectedEventIndex(index)
    setShowEditEventModal(true)
  }

  return (
    <>
      <button
        className={`calendar-event ${event.eventAllDay ? "allday-event" : "timed-event"} ${
          event.eventColor
        }-event`}
        onClick={handleClick}
        title={event.eventName}>
        {event.eventAllDay ? (
          <span className='event-name'>{event.eventName}</span>
        ) : (
          <>
            <span className='event-dot'>●</span>
            <span className='event-time'>{event.eventTimes?.start}</span>
            <span className='event-name'>{event.eventName}</span>
          </>
        )}
      </button>
    </>
  )
}
