// -------------------- contexts/CalendarContext.jsx --------------------
import { createContext, useContext, useMemo, useState } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { useLocalStorage } from "../hooks/useLocalStorage"

// ---------------------------------------------------------------------
// CALENDAR CONTEXT
// Combines both "event data" logic (persistent) and "UI navigation" logic (ephemeral)
// into a single cohesive source of truth for all calendar components.
// ---------------------------------------------------------------------

const CalendarContext = createContext()

export function CalendarProvider({ children }) {
  // 1. EVENT STATE (persistent)
  const [events, setEvents] = useLocalStorage("eventsStoredData", {})

  // Utility: Return all events for a given date key
  function getEventsForDate(date) {
    const key = format(date, "yyyy-MM-dd")
    return events[key] || []
  }

  // Utility: Add event immutably to the correct date key
  function addEvent(date, eventObj) {
    const key = format(date, "yyyy-MM-dd")
    setEvents((prev) => {
      const prevEvents = prev[key] || []
      // Explanation: spread previous object to preserve unrelated days,
      // overwrite only the selected date key with its updated array.
      return { ...prev, [key]: [...prevEvents, eventObj] }
    })
  }

  // Utility: Delete event at given index
  function deleteEvent(date, index) {
    const key = format(date, "yyyy-MM-dd")
    setEvents((prev) => {
      const prevEvents = prev[key] || []
      return { ...prev, [key]: prevEvents.filter((_, i) => i !== index) }
    })
  }
// Update and replace event
function updateEvent(date, index, updatedEvent) {
  const key = format(date, "yyyy-MM-dd")
  setEvents((prev) => {
    const prevEvents = prev[key] || []
    // Replace the event at the given index
    const newEvents = [...prevEvents]
    newEvents[index] = updatedEvent
    return { ...prev, [key]: newEvents }
  })
}


  // 2. UI STATE (ephemeral)
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [showEventModule, setShowEventModule] = useState(false)
  const [showEditEventModule, setShowEditEventModule] = useState(false) // NEW: edit modal state
  const [selectedEventDate, setSelectedEventDate] = useState()
  const [selectedEventIndex, setSelectedEventIndex] = useState(null) // NEW: which event is being edited

  // Computed: visible dates for current month view
  const visibleDates = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth)),
        end: endOfWeek(endOfMonth(visibleMonth)),
      }),
    [visibleMonth]
  )

  // Calendar navigation helpers
  function showPreviousMonth() {
    setVisibleMonth((m) => addMonths(m, -1))
  }
  function showNextMonth() {
    setVisibleMonth((m) => addMonths(m, 1))
  }

  // -------------------------------------------------------------------
  // 3. MEMOIZED CONTEXT VALUE
  // -------------------------------------------------------------------
  // Split into logical groups to prevent unnecessary re-renders:
  // - eventsAPI: persistent CRUD and storage
  // - ui: navigation and modal state
  const value = useMemo(
    () => ({
      eventsAPI: { events, getEventsForDate, addEvent, deleteEvent },
      ui: {
        visibleMonth,
        setVisibleMonth,
        visibleDates,
        showEventModule,
        setShowEventModule,
        selectedEventDate,
        setSelectedEventDate,
        showEditEventModule, // NEW
        setShowEditEventModule, // NEW
        selectedEventIndex, // NEW
        setSelectedEventIndex, // NEW
        showPreviousMonth,
        showNextMonth,
      },
    }),
    [
      events,
      visibleMonth,
      visibleDates,
      showEventModule,
      selectedEventDate,
      showEditEventModule, // NEW
      selectedEventIndex, // NEW
    ]
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

// ---------------------------------------------------------------------
// Custom hook for consuming the unified calendar context.
// ---------------------------------------------------------------------
export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider")
  return context
}
