import { useEffect, useState, useCallback, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import type { CalendarEventForm, CalendarEventWithId } from "../../contexts/CalendarContext"
import {
  useCalendar,
  to12HourFormat,
  GLOBAL_EVENT_KEY_DATE_FORMAT,
  Event_Form_Default,
} from "../../contexts/CalendarContext"
import "./eventModals.css"
import closeBtnImg from "../../img/symmetrical_x_btn.png"

export function EditEventModal() {
  const {
    ui: {
      showEditEventModal,
      setShowEditEventModal,
      selectedEventDate,
      selectedEventId,
      setSelectedEventId,
      modalAnimatingOut,
      setModalAnimatingOut,
    },
    eventsAPI: { getEventsForDate, deleteEvent, updateEvent },
  } = useCalendar()

  const [eventData, setEventData] = useState<CalendarEventWithId>({
    eventId: "",
    eventForm: Event_Form_Default,
  })

  useEffect(() => {
    if (showEditEventModal && selectedEventDate != null && selectedEventId != "") {
      const events = getEventsForDate(selectedEventDate)
      const event = events.find((e) => e.eventId === selectedEventId)
      if (event !== null) {
        setEventData({
          eventId: selectedEventId,
          eventForm: {
            eventName: event?.eventForm.eventName || "",
            eventAllDay: event?.eventForm.eventAllDay || false,
            eventStartTime: event?.eventForm.eventStartTime || "",
            eventEndTime: event?.eventForm.eventEndTime || "",
            eventColor: event?.eventForm.eventColor || "red",
          },
        })
      }
    }
  }, [showEditEventModal, selectedEventDate, selectedEventId, getEventsForDate])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!eventData) return
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value
    setEventData((prev) => ({
      ...prev,
      eventForm: {
        ...prev.eventForm,
        [name]: newValue,
      },
    }))

    if (name === "eventEndTime") {
      e.target.setCustomValidity("")
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventDate || eventData === null) return

    if (!eventData.eventForm.eventAllDay) {
      const form = e.currentTarget
      const endInputEl = form.querySelector<HTMLInputElement>('input[name="eventEndTime"]')

      if (endInputEl) {
        endInputEl.setCustomValidity("")

        const endTime = eventData.eventForm.eventEndTime
        const startTime = eventData.eventForm.eventStartTime

        if (endTime != null && startTime != null && endTime < startTime) {
          endInputEl.setCustomValidity(`Value must be ${to12HourFormat(startTime)} or later.`)
          endInputEl.reportValidity()
          return
        }
      }
    }

    updateEvent(selectedEventDate, {
      eventId: eventData.eventId,
      eventForm: {
        eventName: eventData.eventForm.eventName,
        eventAllDay: eventData.eventForm.eventAllDay,
        eventStartTime: eventData.eventForm.eventStartTime,
        eventEndTime: eventData.eventForm.eventEndTime,
        eventColor: eventData.eventForm.eventColor,
      },
    })
    setEventData({ eventId: "", eventForm: Event_Form_Default })
    setSelectedEventId("")
    setShowEditEventModal(false)
  }

  const handleDelete = () => {
    if (!selectedEventDate) return
    deleteEvent(selectedEventDate, eventData.eventId)
    setShowEditEventModal(false)
    setSelectedEventId("")
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
                value={eventData.eventForm.eventName}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className='event-label'>
            <label className='allDay modal-form-label'>
              <input
                type='checkbox'
                name='eventAllDay'
                checked={eventData.eventForm.eventAllDay}
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
                value={eventData.eventForm.eventStartTime}
                onChange={handleChange}
                disabled={eventData.eventForm.eventAllDay}
                required={!eventData.eventForm.eventAllDay}
              />
            </label>
            <label className='event-time modal-form-label'>
              End Time
              <br />
              <input
                type='time'
                name='eventEndTime'
                value={eventData.eventForm.eventEndTime}
                onChange={handleChange}
                disabled={eventData.eventForm.eventAllDay}
                required={!eventData.eventForm.eventAllDay}
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
                    name='eventColor'
                    value={c}
                    checked={eventData.eventForm.eventColor === c}
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
