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

export const GLOBAL_EVENT_KEY_DATE_FORMAT = "M/dd/yy"

export interface CalendarEvent {
  eventName: string
  eventAllDay: boolean
  eventTimes: { start: string; end: string } | null
  eventColor: "red" | "green" | "blue"
}
export type EventsMap = Record<string, CalendarEvent[]>

export interface EventFormState {
  eventName: string
  allDay: boolean
  startTime: string
  endTime: string
  color: "red" | "green" | "blue"
}

export const GLOBAL_EVENT_STATE_DEFAULT: EventFormState = {
  eventName: "",
  allDay: false,
  startTime: "",
  endTime: "",
  color: "red",
}

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
    showEventModal: boolean
    setShowEventModal: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventDate?: Date | undefined
    setSelectedEventDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    showEditEventModal: boolean
    setShowEditEventModal: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventIndex: number | null
    setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>
    // NEW
    showOverflowModal: boolean
    setShowOverflowModal: React.Dispatch<React.SetStateAction<boolean>>
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
  const [showEventModal, setShowEventModal] = useState<boolean>(false)
  const [showEditEventModal, setShowEditEventModal] = useState<boolean>(false)
  //NEW
  const [showOverflowModal, setShowOverflowModal] = useState<boolean>(false)
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
        showEventModal,
        setShowEventModal,
        // NEW
        showOverflowModal,
        setShowOverflowModal,
        //NEW
        selectedEventDate,
        setSelectedEventDate,
        showEditEventModal,
        setShowEditEventModal,
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
      showEventModal,
      selectedEventDate,
      showEditEventModal,
      selectedEventIndex,
      // NEW showOverflorModal
      showOverflowModal,
    ]
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider")
  return context
}
