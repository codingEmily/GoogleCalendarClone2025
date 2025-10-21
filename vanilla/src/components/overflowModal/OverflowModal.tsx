import { useEffect, useState, useMemo, type ChangeEvent, type FormEvent } from "react"
import { format } from "date-fns"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import { useCalendar } from "../../contexts/CalendarContext"
import { GLOBAL_EVENT_KEY_DATE_FORMAT } from "../../contexts/CalendarContext"
import "./overflowModal.css"

interface OverflowDatesProps {
  date: Date
  index: number
}

export function OverflowModal({ date, index }: OverflowDatesProps) {
  const {
    ui: { showOverflowModal, setShowOverflowModal, selectedEventDate },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  const events: CalendarEvent[] = getEventsForDate(date) || []

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
          <span className='overflow-date'>00/00/00</span>

          <button className='overflow-close-btn' onClick={() => setShowOverflowModal(false)}>
            x
          </button>
        </div>

        <div className='overflow-events-list'>/// SHOW EVENTS HERE</div>
      </div>
    </>
  )
}
