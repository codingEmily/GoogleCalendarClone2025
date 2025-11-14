import { useEffect, useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import type { CalendarEventWithId } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
import EventCell from "../eventCell/EventCell"
import closeBtnImg from "../../img/symmetrical_x_btn.png"

import "./overflowModal.css"

export function OverflowModal() {
  const {
    ui: {
      showOverflowModal,
      setShowOverflowModal,
      selectedEventDate,
      setSelectedEventDate,
      modalAnimatingOut,
      setModalAnimatingOut,
    },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  const events: CalendarEventWithId[] =
    selectedEventDate != null ? getEventsForDate(selectedEventDate) : []
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.eventForm.eventAllDay && !b.eventForm.eventAllDay) return -1
      if (!a.eventForm.eventAllDay && b.eventForm.eventAllDay) return 1
      if (a.eventForm.eventAllDay && b.eventForm.eventAllDay) return 0

      const aStart = a.eventForm.eventStartTime ?? ""
      const bStart = b.eventForm.eventStartTime ?? ""
      return aStart.localeCompare(bStart)
    })
  }, [events])

  const handleAnimationEnd = useCallback(() => {
    if (modalAnimatingOut) {
      setShowOverflowModal(false)
      setModalAnimatingOut(false)
    }
  }, [modalAnimatingOut, setModalAnimatingOut, setShowOverflowModal])

  if (!showOverflowModal && !modalAnimatingOut) return null

  return (
    <>
      <div className={`overlay ${showOverflowModal ? "show" : ""}`} />
      <div
        className={`overflow-modal ${showOverflowModal ? "show" : ""} ${
          modalAnimatingOut ? "hide" : ""
        }`}
        onAnimationEnd={handleAnimationEnd}>
        <div className='overflow-module-header'>
          <span className='overflow-date'>
            {selectedEventDate && `${format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT)}`}
          </span>

          <button className='overflow-close-btn' onClick={() => setModalAnimatingOut(true)}>
            <img className='close-btn-img' alt='close button' src={closeBtnImg}></img>
          </button>
        </div>

        <div className='overflow-events-list'>
          {selectedEventDate != null &&
            sortedEvents.map((event, i) => (
              <EventCell key={i} event={event} index={i} date={selectedEventDate} />
            ))}
        </div>
      </div>
    </>
  )
}
