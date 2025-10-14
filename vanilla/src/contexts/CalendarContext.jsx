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

export const GLOBAL_EVENT_KEY_DATE_FORMAT = "yyyy-MM-dd"

const CalendarContext = createContext()

export function CalendarProvider({ children }) {
  ///MY THOUGHTS-
  //  I don't really understand having a component, the purpose of which
  //  is to be a context provider, it provides a million function and no jsx,
  /// but you also have the separate CalendarContext, and then a
  // function useCalendar for actually implementing this context stuff.
  //  It feels unnecessarily convoluted

  const [events, setEvents] = useLocalStorage("eventsStoredData", {})

  function getEventsForDate(date) {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    return events[key] || []
  }

  function addEvent(date, newEvent) {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      return { ...prev, [key]: [...prevEventsForSelectedDate, newEvent] }
    })
  } /// NOT REALLY UNDERSTANDING what's happening in the setEvent logic

  function deleteEvent(date, index) {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      return { ...prev, [key]: prevEventsForSelectedDate.filter((_, i) => i !== index) }
    })
  }

  //////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////
  // Update and replace event
  function updateEvent(date, index, updatedEvent) {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      // Replace the event at the given index
      const newEvents = [...prevEventsForSelectedDate] // copying array
      newEvents[index] = updatedEvent // replacing original event at selected index
      return { ...prev, [key]: newEvents }
    })
  } //THIS IS WHERE IT'S EDITING an event, which is still really deleting and replacing,
  // but at least you keep the original index- I think
  /////////////////////////////////////////////////////////////////////////////////

  // 2. UI STATE (ephemeral)
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [showEventModule, setShowEventModule] = useState(false)
  const [showEditEventModule, setShowEditEventModule] = useState(false)
  const [selectedEventDate, setSelectedEventDate] = useState()
  const [selectedEventIndex, setSelectedEventIndex] = useState(null)

  const visibleDates = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth)),
        end: endOfWeek(endOfMonth(visibleMonth)),
      }),
    [visibleMonth]
  )

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
      eventsAPI: { events, getEventsForDate, addEvent, deleteEvent, updateEvent },
      ui: {
        visibleMonth,
        setVisibleMonth,
        visibleDates,
        showEventModule,
        setShowEventModule,
        selectedEventDate,
        setSelectedEventDate,
        showEditEventModule,
        setShowEditEventModule,
        selectedEventIndex,
        setSelectedEventIndex,
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
      showEditEventModule,
      selectedEventIndex,
    ] // all I know if every var in the memo is in the d-array, and ofc none of the funtions are
  ) // I don't fully understand this useMemo, or why it's one huge one instead of more, smaller useMemo'<s className="
  // If the useMemo updates Everytime one of the items in the dependency array change, then doesn't that defeat the purpose of having a useMemo?
  // What re-renders is it ignoring?
  // Aren't functions supposed to be memo'ed inside of useCallbacks or something?

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
