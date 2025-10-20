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
      setShowEventModule,
      setShowEditEventModule,
      setShowOverflowModule,
      setSelectedEventIndex,
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
    setShowEventModule(true)
  }

  const openOverflowModal = () => {
    // setSelectedEventDate(date)
    setShowOverflowModule(true)
    console.log("see x more btn clicked")
  }

  // --- Overflow tracking setup ---
  const eventsListRef = useRef<HTMLDivElement | null>(null)
  const [hiddenCount, setHiddenCount] = useState(0)

  // Throttled overflow checker using requestAnimationFrame
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

  // Debounce wrapper to avoid over-triggering
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

  // Hook: observe size + child mutations
  useEffect(() => {
    const container = eventsListRef.current
    if (!container) return

    const resizeObs = new ResizeObserver(scheduleCheck)
    const mutationObs = new MutationObserver(scheduleCheck)

    resizeObs.observe(container)
    mutationObs.observe(container, { childList: true })

    // Initial measurement
    scheduleCheck()

    // Cleanup
    return () => {
      resizeObs.disconnect()
      mutationObs.disconnect()
    }
  }, [sortedEvents.length]) // trigger recalculation when event count changes

  return (
    <div
      className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}
        ${isPast(date) && !isToday(date) ? "prev-day-overlay" : ""}`}>
      <button onClick={openEventModalForDate} className='add-event-btn'>
        +
      </button>

      <div className='date-header'>
        {row === 0 && <div className='weekday-label'>{weekdayLabels[col]}</div>}
        <div className={`date-num ${isToday(date) ? "today" : ""}`}>{date.getDate()}</div>
      </div>

      <div className={`events-list ${hiddenCount > 0 ? "overflow" : ""}`} ref={eventsListRef}>
        {sortedEvents.map((event, i) => (
          <EventCell key={i} event={event} index={i} date={date} />
        ))}
      </div>
      <div className={`see-more-btn-section ${hiddenCount > 0 ? "show" : ""}`}>
        {hiddenCount > 0 && (
          <button className='see-more-btn' onClick={openOverflowModal}>
            See {hiddenCount} more
          </button>
        )}
      </div>
    </div>
  )
}

//// WORKING DATECELL WITHOUT TRUNCATION

// import { format, isSameMonth, isToday, isPast } from "date-fns"
// import { useMemo } from "react"
// import { useCalendar } from "../../contexts/CalendarContext"
// import EventCell from "../eventCell/EventCell"
// import type { CalendarEvent } from "../../contexts/CalendarContext"
// import "./dateCell.css"

// interface DateCellProps {
//   date: Date
//   index: number
// }

// export function DateCell({ date, index }: DateCellProps) {
//   const {
//     ui: {
//       visibleMonth,
//       setShowEventModule,
//       setShowEditEventModule,
//       setSelectedEventIndex,
//       setSelectedEventDate,
//     },
//     eventsAPI: { getEventsForDate },
//   } = useCalendar()

//   const row = Math.floor(index / 7)
//   const col = index % 7
//   const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

//   const events: CalendarEvent[] = getEventsForDate(date) || []

//   const sortedEvents = useMemo(() => {
//     return [...events].sort((a, b) => {
//       if (a.eventAllDay && !b.eventAllDay) return -1
//       if (!a.eventAllDay && b.eventAllDay) return 1
//       if (a.eventAllDay && b.eventAllDay) return 0

//       const aStart = a.eventTimes?.start ?? ""
//       const bStart = b.eventTimes?.start ?? ""
//       return aStart.localeCompare(bStart)
//     })
//   }, [events])

//   const openEventModalForDate = () => {
//     setSelectedEventDate(date)
//     setShowEventModule(true)
//   }

//   return (
//     <>
//       <div
//         className={`date ${!isSameMonth(date, visibleMonth) ? "out-of-month-day" : ""}
//         ${isPast(date) && !isToday(date) ? "prev-day-overlay" : ""}`}>
//         <button onClick={openEventModalForDate} className='add-event-btn'>
//           +
//         </button>

//         <div className='date-header'>
//           {row === 0 && <div className='weekday-label'>{weekdayLabels[col]}</div>}
//           <div className={`date-num ${isToday(date) ? "today" : ""}`}>{date.getDate()}</div>
//         </div>

//         <div className='events-list'>
//           {sortedEvents.map((event, i) => (
//             <EventCell key={i} event={event} index={i} date={date} />
//           ))}
//         </div>
//       </div>
//     </>
//   )
// }
