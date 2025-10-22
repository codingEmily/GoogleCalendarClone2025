import { useEffect, useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
import "./overflowModal.css"

export function OverflowModal() {
  const {
    ui: { showOverflowModal, setShowOverflowModal, selectedEventDate, setSelectedEventDate },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  // useCallback(() => {
  //   if (showOverflowModal && selectedEventDate != null) {
  //     const events: CalendarEvent[] = getEventsForDate(selectedEventDate) || []
  //     console.log("useCallback response from overflowModal")
  //     return [...events].sort((a, b) => {
  //       if (a.eventAllDay && !b.eventAllDay) return -1
  //       if (!a.eventAllDay && b.eventAllDay) return 1
  //       if (a.eventAllDay && b.eventAllDay) return 0

  //       const aStart = a.eventTimes?.start ?? ""
  //       const bStart = b.eventTimes?.start ?? ""
  //       return aStart.localeCompare(bStart)
  //     })
  //   }
  // }, [showOverflowModal, selectedEventDate]) //dependency array

  // setSelectedEventDate != null && const events: CalendarEvent[] = getEventsForDate(setSelectedEventDate) || []

  const events: CalendarEvent[] =
    selectedEventDate != null ? getEventsForDate(selectedEventDate) : []
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.eventAllDay && !b.eventAllDay) return -1
      if (!a.eventAllDay && b.eventAllDay) return 1
      if (a.eventAllDay && b.eventAllDay) return 0

      const aStart = a.eventTimes?.start ?? ""
      const bStart = b.eventTimes?.start ?? ""
      return aStart.localeCompare(bStart)
    })
  }, [events])

  return (
    <>
      <div className={`overlay ${showOverflowModal ? "show" : ""}`} />
      <div className={`overflow-modal ${showOverflowModal ? "show" : ""}`}>
        <div className='overflow-module-header'>
          <span className='overflow-date'>
            {selectedEventDate && `${format(selectedEventDate, GLOBAL_EVENT_KEY_DATE_FORMAT)}`}
          </span>

          <button className='overflow-close-btn' onClick={() => setShowOverflowModal(false)}>
            x
          </button>
        </div>

        <div className='overflow-events-list'>{}</div>
      </div>
    </>
  )
}
