import { useState, useCallback, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import {
  type CalendarEvent,
  type EventFormState,
  useCalendar,
  GLOBAL_EVENT_KEY_DATE_FORMAT,
  GLOBAL_EVENT_STATE_DEFAULT,
  to12HourFormat,
} from "../../contexts/CalendarContext"
import "./eventModals.css"
import closeBtnImg from "../../app/symmetrical_x_btn.png"

export function AddEventModal() {
  const {
    ui: {
      showEventModal,
      setShowEventModal,
      selectedEventDate,
      modalAnimatingOut,
      setModalAnimatingOut,
    },
    eventsAPI: { addEvent },
  } = useCalendar()

  const [eventData, setEventData] = useState<EventFormState>(GLOBAL_EVENT_STATE_DEFAULT)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (name === "endTime") {
      e.target.setCustomValidity("")
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventDate) return

    const form = e.currentTarget
    const startInputEl = form.querySelector<HTMLInputElement>('input[name="startTime"]')
    const endInputEl = form.querySelector<HTMLInputElement>('input[name="endTime"]')
    endInputEl?.setCustomValidity("")

    if (!eventData.allDay && startInputEl && endInputEl) {
      const startValue = startInputEl.value
      const endValue = endInputEl.value

      if (startValue && endValue && endValue < startValue) {
        endInputEl?.setCustomValidity(
          `Value must be ${to12HourFormat(eventData.startTime)} or later.`
        )
        endInputEl?.reportValidity()
        return
      }
    }
    addEvent(selectedEventDate, {
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

    setModalAnimatingOut(true)
    setEventData(GLOBAL_EVENT_STATE_DEFAULT)
  }

  const handleAnimationEnd = useCallback(() => {
    if (modalAnimatingOut) {
      setShowEventModal(false)
      setModalAnimatingOut(false)
    }
  }, [modalAnimatingOut, setModalAnimatingOut, setShowEventModal])

  if (!showEventModal && !modalAnimatingOut) return null

  return (
    <>
      <div className={`overlay ${showEventModal ? "show" : ""}`} />
      <div
        className={`event-modal ${showEventModal ? "show" : ""} ${modalAnimatingOut ? "hide" : ""}`}
        onAnimationEnd={handleAnimationEnd}>
        <div className='event-modal-header'>
          <span className='event-modal-header-name'>Add Event</span>
          <span className='event-modal-header-date'>
            {selectedEventDate ? format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT) : ""}
          </span>
          <button
            className='event-modal-header-close-btn'
            onClick={() => setModalAnimatingOut(true)}>
            <img className='close-btn-img' alt='close btn' src={closeBtnImg}></img>
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
                name='allDay'
                checked={eventData.allDay}
                onChange={handleChange}
              />
              All Day?
            </label>
          </div>

          <div className='event-label event-times'>
            <label className='event-time modal-form-label'>
              <span>Start Time</span>
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
