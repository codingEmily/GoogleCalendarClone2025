// components/EventModal.jsx
import React, { useState } from "react"
import { format } from "date-fns"
import { useCalendar } from "../contexts/CalendarContext"

/*
  EventModal:
  -----------
  - Displays a modal to add a new event for the selected date.
  - Uses eventsAPI.addEvent to persist event data.
  - Uses ui.setShowEventModule and ui.selectedEventDate from context.
*/

export default function EventModal() {
  const {
    ui: { showEventModule, setShowEventModule, selectedEventDate },
    eventsAPI: { addEvent },
  } = useCalendar()

  // --- Event form state ---
  const [eventData, setEventData] = useState({
    eventName: "",
    allday: false,
    startTime: "",
    endTime: "",
    color: "red",
  })

  // --- Handle input changes ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // --- Handle form submission ---
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEventDate) return

    // --- Validation ---
    if (!eventData.eventName.trim()) {
      alert("Event name is required.")
      return
    }

    if (!eventData.allday) {
      if (!eventData.startTime || !eventData.endTime) {
        alert("Start and End times are required if event is not all-day.")
        return
      }
      if (eventData.endTime <= eventData.startTime) {
        alert("End time must be later than start time.")
        return
      }
    }

    // --- Add event to context ---
    addEvent(selectedEventDate, {
      eventName: eventData.eventName,
      eventAllday: eventData.allday,
      eventTimes: eventData.allday ? null : { start: eventData.startTime, end: eventData.endTime },
      eventColor: eventData.color,
    })

    // --- Reset form and close modal ---
    setShowEventModule(false)
    setEventData({ eventName: "", allday: false, startTime: "", endTime: "", color: "red" })
  }

  return (
    <>
      <div className={`overlay ${showEventModule ? "show" : ""}`} />
      <div className={`event-module ${showEventModule ? "show" : ""}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Add Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, "MM/dd/yy") : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEventModule(false)}>
            x
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          {/* Event Name */}
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

          {/* All-Day Checkbox */}
          <div className='event-label'>
            <label className='allday'>
              <input
                type='checkbox'
                name='allday'
                checked={eventData.allday}
                onChange={handleChange}
              />
              All Day?
            </label>
          </div>

          {/* Start/End Times */}
          <div className='event-label event-times'>
            <label className='event-time'>
              Start Time
              <br />
              <input
                type='time'
                name='startTime'
                value={eventData.startTime}
                onChange={handleChange}
                disabled={eventData.allday}
                required={!eventData.allday}
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
                disabled={eventData.allday}
                required={!eventData.allday}
              />
            </label>
          </div>

          {/* Color Selection */}
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

          {/* Submit */}
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
