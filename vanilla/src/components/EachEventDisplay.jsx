import React from "react"
import { useCalendar } from "../contexts/CalendarContext"

/*
  EachEventDisplay:
  - Clicking an event now opens the EditEventModal.
  - We store both the date and index of the clicked event in context.
*/

export default function EachEventDisplay({ event, index, date }) {
  const {
    ui: { setShowEditEventModule, setSelectedEventDate, setSelectedEventIndex },
  } = useCalendar()

  const handleClick = (e) => {
    console.log("clicked")
    e.stopPropagation()
    setSelectedEventDate(date)
    setSelectedEventIndex(index) // NEW: store which event is being edited
    setShowEditEventModule(true) // open the edit modal
  }

  //   const colorStyle = {
  //     backgroundColor: event.eventColor || "#cce5ff",
  //     borderLeft: `3px solid ${event.eventColor || "#007bff"}`,
  //   }

  return (
    <button
      //   className='event-display'

      //   style={colorStyle}
      className={`calendar-event ${event.eventAllday ? "allday-event" : "timed-event"}
             ${event.eventColor}-event`}
      onClick={handleClick}
      title={event.eventName}>
      {/* {!event.eventAllday && event.eventTimes?.start && (
        <span className='event-time'>
          {event.eventTimes.start}
          {event.eventTimes.end ? `–${event.eventTimes.end}` : ""}
        </span>
      )}
      <span className='event-name'>{event.eventName}</span> */}
      {event.eventAllday ? (
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

// // components/EachEventDisplay.jsx
// import React from "react"
// import { useCalendar } from "../contexts/CalendarContext"

// /*
//   EachEventDisplay:
//   -----------------
//   A small, focused component that renders one event bubble inside a date cell.

//   Responsibilities:
//   - Display event name, time (if not all-day), and color.
//   - Handle clicks to open the event modal (for view/edit).
//   - Styling and layout remain consistent with your previous design.
// */

// export default function EachEventDisplay({ event, onClick }) {
//   const {
//     eventsAPI: { deleteEvent },
//     ui: { setShowEventModule, setSelectedEventDate },
//   } = useCalendar()

//   const handleClick = (e) => {
//     e.stopPropagation()
//     if (onClick) onClick() // parent-provided handler (usually opens modal)
//   }

//   // Optional: could expose delete logic here later
//   // const handleDelete = (e) => {
//   //   e.stopPropagation()
//   //   deleteEvent(eventDate, eventIndex)
//   // }

//   // Event color — use provided event.color if defined, fallback to default
//   const colorStyle = {
//     backgroundColor: event.color || "#cce5ff",
//     borderLeft: `3px solid ${event.color || "#007bff"}`,
//   }

//   return (
//     <div className='event-display' style={colorStyle} onClick={handleClick} title={event.eventName}>
//       {/* Time display only if not an all-day event */}
//       {!event.eventAllday && event.eventTimes?.start && (
//         <span className='event-time'>
//           {event.eventTimes.start}
//           {event.eventTimes.end ? `–${event.eventTimes.end}` : ""}
//         </span>
//       )}

//       {/* Event name */}
//       <span className='event-name'>{event.eventName}</span>
//     </div>
//   )
// }
