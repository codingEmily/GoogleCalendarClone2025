import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { useCalendar } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
// import "./eventModals.css"

const GLOBAL_EVENT_STATE_InitialValue = {
  eventName: "",
  allDay: false,
  startTime: "",
  endTime: "",
  color: "red",
}

export function AddEventModal() {
  const {
    ui: { showEventModule, setShowEventModule, selectedEventDate },
    eventsAPI: { addEvent },
  } = useCalendar()

  // --- Event form state ---
  const [eventData, setEventData] = useState(GLOBAL_EVENT_STATE_InitialValue)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  /// *** !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  *** ////////////
  //// UPDATE VALIDATION TO FIT VIDEO
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEventDate) return

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

    addEvent(selectedEventDate, {
      eventName: eventData.eventName,
      eventAllDay: eventData.allDay,
      eventTimes: eventData.allDay ? null : { start: eventData.startTime, end: eventData.endTime },
      eventColor: eventData.color,
    })

    setShowEventModule(false)
    setEventData({ eventName: "", allDay: false, startTime: "", endTime: "", color: "red" })
  }

  return (
    <>
      <div className={`overlay ${showEventModule ? "show" : ""}`} />
      <div className={`event-module ${showEventModule ? "show" : ""}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Add Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEventModule(false)}>
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
            <label className='allday'>
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

          <div className='event-submit-btn-section'>
            <button className='event-submit-btn' type='submit'>
              Add
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
/* EDIT EVENT MODULE */
export function EditEventModal() {
  const {
    ui: { showEditEventModule, setShowEditEventModule, selectedEventDate, selectedEventIndex },
    eventsAPI: { getEventsForDate, addEvent, deleteEvent, updateEvent },
  } = useCalendar()

  const [eventData, setEventData] = useState(GLOBAL_EVENT_STATE_InitialValue)

  // Pre-populate when modal opens /// Consider turning this into a named
  // func/var just for the sake of readability
  useEffect(() => {
    if (showEditEventModule && selectedEventDate != null && selectedEventIndex != null) {
      const events = getEventsForDate(selectedEventDate)
      const event = events[selectedEventIndex]
      if (event) {
        setEventData({
          eventName: event.eventName,
          allDay: event.eventAllDay,
          startTime: event.eventTimes?.start || "",
          endTime: event.eventTimes?.end || "",
          color: event.eventColor,
        })
      }
    }
  }, [showEditEventModule, selectedEventDate, selectedEventIndex, getEventsForDate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
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
      eventTimes: eventData.allDay ? null : { start: eventData.startTime, end: eventData.endTime },
      eventColor: eventData.color,
    })
    setShowEditEventModule(false)
  }

  const handleDelete = () => {
    if (!selectedEventDate || selectedEventIndex == null) return
    deleteEvent(selectedEventDate, selectedEventIndex)
    setShowEditEventModule(false)
  }

  if (!showEditEventModule) return null

  return (
    <>
      <div className={`overlay ${showEditEventModule ? "show" : ""}`} />
      <div className={`edit-event-module ${showEditEventModule ? "show" : ""}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Edit Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEditEventModule(false)}>
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

          <div
            className='event-submit-btn-section'
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              height: "80px",
              marginTop: "10px",
              bottom: "0",
            }}>
            <button type='button' className='edit-event-btns delete-btn' onClick={handleDelete}>
              Delete
            </button>

            <button type='submit' className='event-submit-btn edit-event-btns'>
              Edit
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
