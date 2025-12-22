import { useState, useCallback, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import {
  type CalendarEventForm,
  type CalendarEventWithId,
  Event_Form_Default,
  useCalendar,
  GLOBAL_EVENT_KEY_DATE_FORMAT,
  to12HourFormat,
} from "../../contexts/CalendarContext"
import "./eventModals.css"
import closeBtnImg from "../../img/symmetrical_x_btn.png"

export function AddEventModal() {
  const {
    ui: {
      showAddEventModal,
      setShowAddEventModal,
      setSelectedEventId,
      selectedEventDate,
      modalAnimatingOut,
      setModalAnimatingOut,
    },
    eventsAPI: { addEvent },
  } = useCalendar()

  function generateId() {
    return crypto.randomUUID()
  }

  const [eventData, setEventData] = useState<CalendarEventForm>(Event_Form_Default)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setEventData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (name === "eventEndTime") {
      e.target.setCustomValidity("")
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventDate) return
    if (!eventData.eventAllDay) {
      const form = e.currentTarget
      const endInputEl = form.querySelector<HTMLInputElement>('input[name="eventEndTime"]')

      if (endInputEl && (eventData.eventStartTime || eventData.eventEndTime)) {
        endInputEl.setCustomValidity("")

        if (
          eventData.eventStartTime &&
          eventData.eventEndTime &&
          eventData.eventEndTime < eventData.eventStartTime
        ) {
          endInputEl.setCustomValidity(
            `Value must be ${to12HourFormat(eventData.eventStartTime)} or later.`
          )
          endInputEl.reportValidity()
          return
        }
      }
    }

    addEvent(selectedEventDate, {
      eventId: generateId(),
      eventForm: {
        eventName: eventData.eventName,
        eventAllDay: eventData.eventAllDay,
        eventStartTime: eventData.eventAllDay ? "" : eventData.eventStartTime,
        eventEndTime: eventData.eventAllDay ? "" : eventData.eventEndTime,
        eventColor: eventData.eventColor,
      },
    })
    setModalAnimatingOut(true)
    setEventData(Event_Form_Default)
    setSelectedEventId("")
  }

  const handleAnimationEnd = useCallback(() => {
    if (modalAnimatingOut) {
      setShowAddEventModal(false)
      setModalAnimatingOut(false)
    }
  }, [modalAnimatingOut, setModalAnimatingOut, setShowAddEventModal])

  if (!showAddEventModal && !modalAnimatingOut) return null

  return (
    <>
      <div className={`overlay ${showAddEventModal ? "show" : ""}`} />
      <div
        className={`event-modal ${showAddEventModal ? "show" : ""} ${
          modalAnimatingOut ? "hide" : ""
        }`}
        onAnimationEnd={handleAnimationEnd}>
        <div className='event-modal-header'>
          <span className='event-modal-header-name'>Add Event</span>
          <span className='event-modal-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-modal-header-close-btn'
            onClick={() => setModalAnimatingOut(true)}>
            <img className='close-btn-img' alt='close button' src={closeBtnImg} />
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
            <label className='allday modal-form-label'>
              <input
                type='checkbox'
                name='eventAllDay'
                checked={eventData.eventAllDay}
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
                name='eventStartTime'
                value={eventData.eventStartTime}
                onChange={handleChange}
                disabled={eventData.eventAllDay}
                required={!eventData.eventAllDay}
              />
            </label>

            <label className='event-time modal-form-label'>
              End Time
              <br />
              <input
                type='time'
                name='eventEndTime'
                value={eventData.eventEndTime}
                onChange={handleChange}
                disabled={eventData.eventAllDay}
                required={!eventData.eventAllDay}
              />
            </label>
          </div>

          <div className='event-label'>
            <label className='color modal-form-label'>
              Color
              <br />
              <div className='radio-group'>
                {["red", "green", "blue"].map((c) => (
                  <label>
                    <input
                      key={c}
                      type='radio'
                      id={c}
                      name='eventColor'
                      value={c}
                      checked={eventData.eventColor === c}
                      onChange={handleChange}
                    />
                  </label>
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
