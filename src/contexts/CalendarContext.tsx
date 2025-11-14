import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { parse } from "date-fns"
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
import * as React from "react"

export const GLOBAL_EVENT_KEY_DATE_FORMAT = "M/dd/yy"
export const GLOBAL_EVENT_TIMES_FORMAT = "h:mm a"

export function to12HourFormat(time: string): string {
  const date = parse(time, "HH:mm", new Date())
  return format(date, GLOBAL_EVENT_TIMES_FORMAT)
}
export interface CalendarEventForm {
  eventName: string
  eventAllDay: boolean
  eventStartTime: ""
  eventEndTime: ""
  eventColor: "red" | "green" | "blue"
}

export interface CalendarEventWithId {
  eventId: string
  eventForm: CalendarEventForm
}

export const Event_Form_Default: CalendarEventForm = {
  eventName: "",
  eventAllDay: true,
  eventStartTime: "",
  eventEndTime: "",
  eventColor: "red",
}

export type EventsMap = Record<string, CalendarEventWithId[]>

interface CalendarContextValue {
  eventsAPI: {
    events: EventsMap
    getEventsForDate: (date: Date) => CalendarEventWithId[]
    addEvent: (date: Date, newEvent: CalendarEventWithId) => void
    deleteEvent: (date: Date, index: number) => void
    updateEvent: (date: Date, index: number, updatedEvent: CalendarEventWithId) => void
  }
  ui: {
    visibleMonth: Date
    setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>
    visibleDates: Date[]
    showAddEventModal: boolean
    setShowAddEventModal: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventDate?: Date | undefined
    setSelectedEventDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    showEditEventModal: boolean
    setShowEditEventModal: React.Dispatch<React.SetStateAction<boolean>>
    modalAnimatingOut: boolean
    setModalAnimatingOut: React.Dispatch<React.SetStateAction<boolean>>
    selectedEventIndex: number | null
    setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>
    selectedEventId: string
    setSelectedEventId: React.Dispatch<React.SetStateAction<string>>
    showOverflowModal: boolean
    setShowOverflowModal: React.Dispatch<React.SetStateAction<boolean>>
    showPreviousMonth: () => void
    showNextMonth: () => void
  }
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined)

interface CalendarProviderProps {
  children: ReactNode
} /*WHY is an interface needed for something so simple??? */
export function CalendarProvider({ children }: CalendarProviderProps) {
  const [events, setEvents] = useLocalStorage<EventsMap>("eventsStoredData", {})

  function getEventsForDate(date: Date): CalendarEventWithId[] {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    return events[key] || []
  }

  function addEvent(date: Date, newEvent: CalendarEventWithId): void {
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

  function updateEvent(date: Date, index: number, updatedEvent: CalendarEventWithId): void {
    const key = format(date, GLOBAL_EVENT_KEY_DATE_FORMAT)
    setEvents((prev) => {
      const prevEventsForSelectedDate = prev[key] || []
      const newEvents = [...prevEventsForSelectedDate]
      newEvents[index] = updatedEvent
      return { ...prev, [key]: newEvents }
    })
  }

  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date())
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false)
  const [showEditEventModal, setShowEditEventModal] = useState<boolean>(false)
  const [modalAnimatingOut, setModalAnimatingOut] = useState<boolean>(false)
  const [showOverflowModal, setShowOverflowModal] = useState<boolean>(false)
  const [selectedEventDate, setSelectedEventDate] = useState<Date>()
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string>("")

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
        showAddEventModal,
        setShowAddEventModal,
        showOverflowModal,
        setShowOverflowModal,
        selectedEventDate,
        setSelectedEventDate,
        showEditEventModal,
        setShowEditEventModal,
        modalAnimatingOut,
        setModalAnimatingOut,
        selectedEventIndex,
        setSelectedEventIndex,
        selectedEventId,
        setSelectedEventId,
        showPreviousMonth,
        showNextMonth,
      },
    }),
    [
      events,
      visibleMonth,
      visibleDates,
      showAddEventModal,
      selectedEventDate,
      showEditEventModal,
      selectedEventIndex,
      showOverflowModal,
      modalAnimatingOut,
    ]
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider")
  return context
}
