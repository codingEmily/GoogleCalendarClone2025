// components/EditEventModal.jsx
import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { useCalendar } from "../contexts/CalendarContext"

/*
  EditEventModal:
  -----------------
  - Opens when a user clicks an existing event.
  - Pre-fills form with event data.
  - Allows editing and saving changes via eventsAPI.addEvent (replace old event).
  - Allows deleting event.
*/

export default function EditEventModal() {
  const {
    ui: { showEditEventModule, setShowEditEventModule, selectedEventDate, selectedEventIndex },
    eventsAPI: { getEventsForDate, addEvent, deleteEvent },
  } = useCalendar()

  // --- Local form state ---
  const [eventData, setEventData] = useState({
    eventName: "",
    allday: false,
    startTime: "",
    endTime: "",
    color: "red",
  })

  // Pre-populate when modal opens
  useEffect(() => {
    if (showEditEventModule && selectedEventDate != null && selectedEventIndex != null) {
      const events = getEventsForDate(selectedEventDate)
      const event = events[selectedEventIndex]
      if (event) {
        setEventData({
          eventName: event.eventName,
          allday: event.eventAllday,
          startTime: event.eventTimes?.start || "",
          endTime: event.eventTimes?.end || "",
          color: event.eventColor,
        })
      }
    }
  }, [showEditEventModule, selectedEventDate, selectedEventIndex, getEventsForDate])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Save changes
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEventDate || selectedEventIndex == null) return

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

    // Delete old event first
    deleteEvent(selectedEventDate, selectedEventIndex)

    // Add updated event
    addEvent(selectedEventDate, {
      eventName: eventData.eventName,
      eventAllday: eventData.allday,
      eventTimes: eventData.allday ? null : { start: eventData.startTime, end: eventData.endTime },
      eventColor: eventData.color,
    })

    // Close modal
    setShowEditEventModule(false)
  }

  // Delete event
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
            {selectedEventDate ? format(selectedEventDate, "MM/dd/yy") : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEditEventModule(false)}>
            x
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          {/* Name */}
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

          {/* All-Day */}
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

          {/* Times */}
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

          {/* Color */}
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

          {/* Buttons */}
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
