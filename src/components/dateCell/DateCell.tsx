import { useEffect, useMemo, useRef, useState } from "react"
import { format, isSameMonth, isToday, isPast } from "date-fns"
import { useCalendar } from "../../contexts/CalendarContext"
import EventCell from "../eventCell/EventCell"
import type { CalendarEvent } from "../../contexts/CalendarContext"
import "./dateCell.css"

interface DateCellProps {
  date: Date
  index: number
}

export function DateCell({ date, index }: DateCellProps) {
  const {
    ui: {
      visibleMonth,
      setShowEventModal,
      setShowOverflowModal,
      showOverflowModal,
      setSelectedEventDate,
    },
    eventsAPI: { getEventsForDate },
  } = useCalendar()

  const row = Math.floor(index / 7)
  const col = index % 7
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

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

  const openEventModalForDate = () => {
    setSelectedEventDate(date)
    setShowEventModal(true)
  }

  const openOverflowModal = () => {
    setSelectedEventDate(date)
    setShowOverflowModal(true)
    console.log("DATE CELL - see x more btn clicked")
    console.log("DATE CELL - showOverflowModal: ", showOverflowModal)
  }

  const eventsListRef = useRef<HTMLDivElement | null>(null)
  const [hiddenCount, setHiddenCount] = useState(0)

  const checkOverflow = () => {
    const container = eventsListRef.current
    if (!container) return

    const total = container.children.length
    if (total === 0) {
      if (hiddenCount !== 0) setHiddenCount(0)
      return
    }

    const containerBottom = container.clientHeight
    let visible = 0
    for (const child of Array.from(container.children)) {
      const el = child as HTMLElement
      if (el.offsetTop + el.offsetHeight <= containerBottom) visible++
    }

    const newHidden = Math.max(total - visible, 0)
    if (newHidden !== hiddenCount) setHiddenCount(newHidden)
  }

  const scheduleCheck = (() => {
    let frame: number | null = null
    return () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        checkOverflow()
        frame = null
      })
    }
  })()

  useEffect(() => {
    const container = eventsListRef.current
    if (!container) return

    const resizeObs = new ResizeObserver(scheduleCheck)
    const mutationObs = new MutationObserver(scheduleCheck)

    resizeObs.observe(container)
    mutationObs.observe(container, { childList: true })

    scheduleCheck()

    return () => {
      resizeObs.disconnect()
      mutationObs.disconnect()
    }
  }, [sortedEvents.length])

  return (
    <div
      className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}
        `}>
      <button onClick={openEventModalForDate} className='add-event-btn'>
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
          <EventCell key={i} event={event} index={i} date={date} />
        ))}

        <div className={`see-more-btn-section ${hiddenCount > 0 ? "show" : ""}`}>
          {hiddenCount > 0 && (
            <button
              className='see-more-btn'
              onClick={() => {
                setSelectedEventDate(date), openOverflowModal()
              }}>
              +{hiddenCount} More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
