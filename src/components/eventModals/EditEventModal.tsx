import { useEffect, useState, useCallback, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import type { CalendarEvent, EventFormState } from "../../contexts/CalendarContext"
import {
  useCalendar,
  to12HourFormat,
  GLOBAL_EVENT_KEY_DATE_FORMAT,
  GLOBAL_EVENT_STATE_DEFAULT,
} from "../../contexts/CalendarContext"

import "./eventModals.css"
import closeBtnImg from "../../img/symmetrical_x_btn.png"

export function EditEventModal() {
  const {
    ui: {
      showEditEventModal,
      setShowEditEventModal,
      selectedEventDate,
      selectedEventIndex,
      modalAnimatingOut,
      setModalAnimatingOut,
    },
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

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setEventData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (name === "endTime") {
      e.target.setCustomValidity("")
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventDate || selectedEventIndex == null) return

    if (!eventData.allDay) {
      const form = e.currentTarget
      const endInputEl = form.querySelector<HTMLInputElement>('input[name="endTime"]')

      if (endInputEl) {
        endInputEl.setCustomValidity("")

        if (eventData.endTime < eventData.startTime) {
          endInputEl.setCustomValidity(
            `Value must be ${to12HourFormat(eventData.startTime)} or later.`
          )
          endInputEl.reportValidity()
          return
        }
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

  const handleAnimationEnd = useCallback(() => {
    if (modalAnimatingOut) {
      setShowEditEventModal(false)
      setModalAnimatingOut(false)
    }
  }, [modalAnimatingOut, setModalAnimatingOut, setShowEditEventModal])

  if (!showEditEventModal && !modalAnimatingOut) return null

  return (
    <>
      <div className={`overlay ${showEditEventModal ? "show" : ""}`} />
      <div
        className={`event-modal ${showEditEventModal ? "show" : ""}  ${
          modalAnimatingOut ? "hide" : ""
        }`}
        onAnimationEnd={handleAnimationEnd}>
        <div className='event-modal-header'>
          <span className='event-modal-header-name'>Edit Event</span>
          <span className='event-modal-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-modal-header-close-btn'
            onClick={() => setModalAnimatingOut(true)}>
            <img src={closeBtnImg} className='close-btn-img' alt='close button'></img>
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          <div className='event-label'>
            <label className='name modal-form-label'>
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
            <label className='allDay modal-form-label'>
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
            <label className='event-time modal-form-label'>
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
            <label className='event-time modal-form-label'>
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
            <label className='color modal-form-label'>
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
