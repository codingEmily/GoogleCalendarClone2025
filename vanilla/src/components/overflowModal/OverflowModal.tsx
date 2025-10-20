import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
import "./overflowModal.css"

interface EventFormState {
  eventName: string
  allDay: boolean
  startTime: string
  endTime: string
  color: "red" | "green" | "blue"
}

const GLOBAL_EVENT_STATE_DEFAULT: EventFormState = {
  eventName: "",
  allDay: false,
  startTime: "",
  endTime: "",
  color: "red",
}

export function OverflowModal() {
  const {
    ui: { showOverflowModule, setShowOverflowModule, selectedEventDate },
  } = useCalendar()

  const [eventData, setEventData] = useState<EventFormState>(GLOBAL_EVENT_STATE_DEFAULT)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  //   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  //     e.preventDefault()
  //     if (!selectedEventDate) return

  //     if (!eventData.eventName.trim()) {
  //       alert("Event name is required.")
  //       return
  //     }

  //     if (!eventData.allDay) {
  //       if (!eventData.startTime || !eventData.endTime) {
  //         alert("Start and End times are required if event is not all-day.")
  //         return
  //       }
  //       if (eventData.endTime <= eventData.startTime) {
  //         alert("End time must be later than start time.")
  //         return
  //       }
  //     }

  //     addEvent(selectedEventDate, {
  //       eventName: eventData.eventName,
  //       eventAllDay: eventData.allDay,
  //       eventTimes: eventData.allDay ? null : { start: eventData.startTime, end: eventData.endTime },
  //       eventColor: eventData.color,
  //     })

  //     setShowEventModule(false)
  //     setEventData(GLOBAL_EVENT_STATE_DEFAULT)
  //   }

  return (
    <>
      <div className={`overlay ${showOverflowModule ? "show" : ""}`} />
      <div className={`overflow-module ${showOverflowModule ? "show" : ""}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Events</span>
          {/* <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span> */}
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowOverflowModule(false)}>
            x
          </button>
        </div>

        <div>/// SHOW EVENTS HERE</div>
      </div>
    </>
  )
}
