// import { createContext, useContext, useMemo, useState } from "react"
// import {
//   addMonths,
//   eachDayOfInterval,
//   endOfMonth,
//   endOfWeek,
//   format,
//   startOfMonth,
//   startOfWeek,
// } from "date-fns"
// import { useLocalStorage } from "../hooks/useLocalStorage"

// export const GLOBAL_EVENT_KEY_DATE_FORMAT = "yyyy-MM-dd"

// const CalendarContext = createContext()

// export function CalendarProvider({ children }) {
//   const [events, setEvents] = useLocalStorage("eventsStoredData", {})

//   function getEventsForDate(date) {
//     const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
//     return events[key] || []
//   }

//   function addEvent(date, newEvent) {
//     const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
//     setEvents((prev) => {
//       const prevEventsForSelectedDate = prev[key] || []
//       return { ...prev, [key]: [...prevEventsForSelectedDate, newEvent] }
//     })
//   }

//   function deleteEvent(date, index) {
//     const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
//     setEvents((prev) => {
//       const prevEventsForSelectedDate = prev[key] || []
//       return { ...prev, [key]: prevEventsForSelectedDate.filter((_, i) => i !== index) }
//     })
//   }

//   function updateEvent(date, index, updatedEvent) {
//     const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
//     setEvents((prev) => {
//       const prevEventsForSelectedDate = prev[key] || []
//       const newEvents = [...prevEventsForSelectedDate]
//       newEvents[index] = updatedEvent
//       return { ...prev, [key]: newEvents }
//     })
//   }

//   const [visibleMonth, setVisibleMonth] = useState(new Date())
//   const [showEventModule, setShowEventModule] = useState(false)
//   const [showEditEventModule, setShowEditEventModule] = useState(false)
//   const [selectedEventDate, setSelectedEventDate] = useState()
//   const [selectedEventIndex, setSelectedEventIndex] = useState(null)

//   const visibleDates = useMemo(
//     () =>
//       eachDayOfInterval({
//         start: startOfWeek(startOfMonth(visibleMonth)),
//         end: endOfWeek(endOfMonth(visibleMonth)),
//       }),
//     [visibleMonth]
//   )

//   function showPreviousMonth() {
//     setVisibleMonth((m) => addMonths(m, -1))
//   }
//   function showNextMonth() {
//     setVisibleMonth((m) => addMonths(m, 1))
//   }

//   const value = useMemo(
//     () => ({
//       eventsAPI: { events, getEventsForDate, addEvent, deleteEvent, updateEvent },
//       ui: {
//         visibleMonth,
//         setVisibleMonth,
//         visibleDates,
//         showEventModule,
//         setShowEventModule,
//         selectedEventDate,
//         setSelectedEventDate,
//         showEditEventModule,
//         setShowEditEventModule,
//         selectedEventIndex,
//         setSelectedEventIndex,
//         showPreviousMonth,
//         showNextMonth,
//       },
//     }),
//     [
//       events,
//       visibleMonth,
//       visibleDates,
//       showEventModule,
//       selectedEventDate,
//       showEditEventModule,
//       selectedEventIndex,
//     ]
//   )

//   return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
// }

// export function useCalendar() {
//   const context = useContext(CalendarContext)
//   if (!context) throw new Error("useCalendar must be used within a CalendarProvider")
//   return context
// }
