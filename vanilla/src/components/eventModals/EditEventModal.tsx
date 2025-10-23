import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"

import { type EventFormState } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_STATE_DEFAULT } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_TIMES_FORMAT } from "../../contexts/CalendarContext"
import "./eventModals.css"

export function EditEventModal() {
  const {
    ui: { showEditEventModal, setShowEditEventModal, selectedEventDate, selectedEventIndex },
    eventsAPI: { getEventsForDate, deleteEvent, updateEvent },
  } = useCalendar()

  const [eventData, setEventData] = useState<EventFormState>(GLOBAL_EVENT_STATE_DEFAULT)

  useEffect(() => {
    if (showEditEventModal && selectedEventDate != null && selectedEventIndex != null) {
      const events = getEventsForDate(selectedEventDate)
      const event = events[selectedEventIndex]
      if (event) {
        setEventData({
          eventName: event.eventName,
          allDay: event.eventAllDay,
          startTime: event.eventTimes?.start || "",
          endTime: event.eventTimes?.end || "",
          color: event.eventColor as "red" | "green" | "blue",
        })
      }
    }
  }, [showEditEventModal, selectedEventDate, selectedEventIndex, getEventsForDate])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventDate || selectedEventIndex == null) return

    if (!eventData.eventName.trim()) {
      alert("Event name is required.")
      return
    }

    if (!eventData.allDay) {
      if (!eventData.startTime || !eventData.endTime) {
        alert("Start and End times are required if event is not all-day.")
        return
      }
      if (eventData.endTime <= eventData.startTime) {
        alert("End time must be later than start time.")
        return
      }
    }

    updateEvent(selectedEventDate, selectedEventIndex, {
      eventName: eventData.eventName,
      eventAllDay: eventData.allDay,
      eventTimes: eventData.allDay
        ? null
        : {
            start: eventData.startTime,
            end: eventData.endTime,
          },
      eventColor: eventData.color,
    })
    setShowEditEventModal(false)
  }

  const handleDelete = () => {
    if (!selectedEventDate || selectedEventIndex == null) return
    deleteEvent(selectedEventDate, selectedEventIndex)
    setShowEditEventModal(false)
  }

  if (!showEditEventModal) return null

  return (
    <>
      <div className={`overlay ${showEditEventModal ? "show" : ""}`} />
      <div className={`edit-event-module ${showEditEventModal ? "show" : ""}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Edit Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEditEventModal(false)}>
            x
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          <div className='event-label'>
            <label className='name'>
              Name
              <br />
              <input
                type='text'
                name='eventName'
                value={eventData.eventName}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className='event-label'>
            <label className='allDay'>
              <input
                type='checkbox'
                name='allDay'
                checked={eventData.allDay}
                onChange={handleChange}
              />
              All Day?
            </label>
          </div>

          <div className='event-label event-times'>
            <label className='event-time'>
              Start Time
              <br />
              <input
                type='time'
                name='startTime'
                value={eventData.startTime}
                onChange={handleChange}
                disabled={eventData.allDay}
                required={!eventData.allDay}
              />
            </label>
            <label className='event-time'>
              End Time
              <br />
              <input
                type='time'
                name='endTime'
                value={eventData.endTime}
                onChange={handleChange}
                disabled={eventData.allDay}
                required={!eventData.allDay}
              />
            </label>
          </div>

          <div className='event-label'>
            <label className='color'>
              Color
              <br />
              <div className='radio-group'>
                {["red", "green", "blue"].map((c) => (
                  <input
                    key={c}
                    type='radio'
                    id={c}
                    name='color'
                    value={c}
                    checked={eventData.color === c}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </label>
          </div>

          <div className='buttons-section'>
            <button type='submit' className='edit-event-btns edit-event-btn '>
              Edit
            </button>
            <button type='button' className='edit-event-btns delete-btn' onClick={handleDelete}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
