import { useEffect, useMemo, useRef, useState } from "react"
import { isSameMonth, isToday, isPast } from "date-fns"
import { useCalendar } from "../../contexts/CalendarContext"
import EventCell from "../eventCell/EventCell"
import type { CalendarEventForm, CalendarEventWithId } from "../../contexts/CalendarContext"
import "./dateCell.css"

interface DateCellProps {
  date: Date
  index: number
}

export function DateCell({ date, index }: DateCellProps) {
  const {
    ui: {
      visibleMonth,
      setShowAddEventModal,
      setShowOverflowModal,
      setSelectedEventDate,
      setModalAnimatingOut,
    },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  const row = Math.floor(index / 7)
  const col = index % 7
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  const events: CalendarEventWithId[] = getEventsForDate(date) || []
  const sortedEvents = useMemo(() => {
    // if (!events || events.length === 0) return
    return [...events].sort((a, b) => {
      if (a.eventForm.eventAllDay && !b.eventForm.eventAllDay) return -1
      if (!a.eventForm.eventAllDay && b.eventForm.eventAllDay) return 1
      if (a.eventForm.eventAllDay && b.eventForm.eventAllDay) return 0

      const aStart = a.eventForm.eventStartTime ?? ""
      const bStart = b.eventForm.eventEndTime ?? ""
      return aStart.localeCompare(bStart)
    })
  }, [events])

  const eventsListRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(sortedEvents.length)
  const hiddenCount = Math.max(0, sortedEvents.length - visibleCount)

  const calculateVisibleEvents = () => {
    const container = eventsListRef.current
    if (!container) return sortedEvents.length

    const children = Array.from(container.children) as HTMLElement[]
    if (children.length === 0) return 0

    const containerRect = container.getBoundingClientRect()
    const containerTop = containerRect.top
    const containerBottom = containerRect.bottom
    const availableHeight = containerRect.height

    if (availableHeight <= 0) return 0

    let visibleCount = 0

    for (const child of children) {
      const childRect = child.getBoundingClientRect()
      const childTop = childRect.top
      const childBottom = childRect.bottom

      // Event is fully visible if both top and bottom are within container bounds
      // We add a small tolerance (1px) for floating point precision issues
      const isFullyVisible = childTop >= containerTop - 1 && childBottom <= containerBottom + 1

      if (isFullyVisible) {
        visibleCount++
      } else if (childTop < containerBottom) {
        // Event is partially visible - stop counting here
        // All subsequent events will also be hidden
        break
      }
    }
    return visibleCount
  }

  // Update the visible count, debounced with RAF for performance
  const updateVisibleCount = useRef<number | null>(null)

  const scheduleVisibilityCheck = () => {
    if (updateVisibleCount.current !== null) {
      cancelAnimationFrame(updateVisibleCount.current)
    }

    updateVisibleCount.current = requestAnimationFrame(() => {
      const newVisibleCount = calculateVisibleEvents()
      setVisibleCount(newVisibleCount)
      updateVisibleCount.current = null
    })
  }

  /**
   * Set up observers to detect when recalculation is needed:
   * - ResizeObserver: when container size changes
   * - MutationObserver: when events are added/removed
   */
  useEffect(() => {
    const container = eventsListRef.current
    if (!container) return

    // Initial check after a short delay to ensure layout is complete
    const initialTimeout = setTimeout(scheduleVisibilityCheck, 0)

    const resizeObserver = new ResizeObserver(scheduleVisibilityCheck)
    const mutationObserver = new MutationObserver(scheduleVisibilityCheck)

    resizeObserver.observe(container)
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearTimeout(initialTimeout)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (updateVisibleCount.current !== null) {
        cancelAnimationFrame(updateVisibleCount.current)
      }
    }
  }, [sortedEvents.length]) // Re-run when number of events changes

  const openEventModalForDate = () => {
    setSelectedEventDate(date)
    setShowAddEventModal(true)
    setModalAnimatingOut(false)
  }

  const openOverflowModal = () => {
    setSelectedEventDate(date)
    setShowOverflowModal(true)
    setModalAnimatingOut(false)
  }

  return (
    <div
      aria-label='select this date'
      className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}
         ${isPast(date) && !isToday(date) ? "prev-day" : ""}`}>
      <button
        onClick={openEventModalForDate}
        className='add-event-btn'
        aria-label='Add event'
        tabIndex={0}>
        +
      </button>

      <div className='date-header'>
        {row === 0 && <div className='weekday-label'>{weekdayLabels[col]}</div>}
        <div className={`date-num ${isToday(date) ? "today" : ""}`}>{date.getDate()}</div>
      </div>

      <div
        className={`events-list ${hiddenCount > 0 ? "overflow" : ""} ${
          isPast(date) && !isToday(date) ? "prev-day" : ""
        }`}
        ref={eventsListRef}>
        {sortedEvents.map((event, i) => (
          <EventCell key={event.eventId} event={event} index={i} date={date} />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className='see-more-btn-section show'>
          <button
            // tabIndex={0}
            className={`see-more-btn ${isPast(date) && !isToday(date) ? "prev-day" : ""}`}
            onClick={openOverflowModal}
            aria-label={`Show ${hiddenCount} more events`}>
            +{hiddenCount} More
          </button>
        </div>
      )}
    </div>
  )
}
