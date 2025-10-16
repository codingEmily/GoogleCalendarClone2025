import React from "react"
import { useCalendar } from "../../contexts/CalendarContext"
// import "./eventCell.css"

export default function EventCell({ event, index, date }) {
  const {
    ui: { setShowEditEventModule, setSelectedEventDate, setSelectedEventIndex },
  } = useCalendar()

  const handleClick = (e) => {
    console.log("clicked")
    e.stopPropagation()
    setSelectedEventDate(date)
    setSelectedEventIndex(index)
    setShowEditEventModule(true)
  }

  return (
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
          <span className='event-time'>{event.eventTimes.start}</span>
          <span className='event-name'>{event.eventName}</span>
        </>
      )}
    </button>
  )
}
