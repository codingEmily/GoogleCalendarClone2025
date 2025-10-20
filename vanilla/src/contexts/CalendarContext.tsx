import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
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

export interface CalendarEvent {
  eventName: string
  eventAllDay: boolean
  eventTimes: { start: string; end: string } | null
  eventColor: "red" | "green" | "blue"
}
export type EventsMap = Record<string, CalendarEvent[]>

interface CalendarContextValue {
  eventsAPI: {
    events: EventsMap
    getEventsForDate: (date: Date) => CalendarEvent[]
    addEvent: (date: Date, newEvent: CalendarEvent) => void
    deleteEvent: (date: Date, index: number) => void
    updateEvent: (date: Date, index: number, updatedEvent: CalendarEvent) => void
  }
  ui: {
    visibleMonth: Date
    setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>
    visibleDates: Date[]
    showEventModule: boolean
    setShowEventModule: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventDate?: Date | undefined
    setSelectedEventDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    showEditEventModule: boolean
    setShowEditEventModule: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventIndex: number | null
    setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>
    // NEW
    showOverflowModule: boolean
    setShowOverflowModule: React.Dispatch<React.SetStateAction<boolean>>
    // NEW
    showPreviousMonth: () => void
    showNextMonth: () => void
  }
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined)

interface CalendarProviderProps {
  children: ReactNode
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [events, setEvents] = useLocalStorage<EventsMap>("eventsStoredData", {})

  function getEventsForDate(date: Date): CalendarEvent[] {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    return events[key] || []
  }

  function addEvent(date: Date, newEvent: CalendarEvent): void {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      return { ...prev, [key]: [...prevEventsForSelectedDate, newEvent] }
    })
  }

  function deleteEvent(date: Date, index: number): void {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      return { ...prev, [key]: prevEventsForSelectedDate.filter((_, i) => i !== index) }
    })
  }

  function updateEvent(date: Date, index: number, updatedEvent: CalendarEvent): void {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      const newEvents = [...prevEventsForSelectedDate]
      newEvents[index] = updatedEvent
      return { ...prev, [key]: newEvents }
    })
  }

  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date())
  const [showEventModule, setShowEventModule] = useState<boolean>(false)
  const [showEditEventModule, setShowEditEventModule] = useState<boolean>(false)
  //NEW
  const [showOverflowModule, setShowOverflowModule] = useState<boolean>(false)
  // NEW
  const [selectedEventDate, setSelectedEventDate] = useState<Date>()
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null)

  const visibleDates = useMemo<Date[]>(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth)),
        end: endOfWeek(endOfMonth(visibleMonth)),
      }),
    [visibleMonth]
  )

  function showPreviousMonth(): void {
    setVisibleMonth((m) => addMonths(m, -1))
  }

  function showNextMonth(): void {
    setVisibleMonth((m) => addMonths(m, 1))
  }

  const value: CalendarContextValue = useMemo(
    () => ({
      eventsAPI: { events, getEventsForDate, addEvent, deleteEvent, updateEvent },
      ui: {
        visibleMonth,
        setVisibleMonth,
        visibleDates,
        showEventModule,
        setShowEventModule,
        // NEW
        showOverflowModule,
        setShowOverflowModule,
        //NEW
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
    ]
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider")
  return context
}
