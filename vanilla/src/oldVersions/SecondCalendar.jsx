import { useEffect, useState, createContext, useContext } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isPast,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"

//
// -------------------- EVENTS CONTEXT (global storage) --------------------
//
const EventsContext = createContext()

export function EventsProvider({ children }) {
  // initialize from localStorage if available
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("eventsStoredData")
    return stored ? JSON.parse(stored) : {}
  })

  useEffect(() => {
    localStorage.setItem("eventsStoredData", JSON.stringify(events))
  }, [events])

  function getEventsForDate(date) {
    const key = format(date, "yyyy-MM-dd")
    return events[key] || []
  }

  function addEvent(date, eventObj) {
    const key = format(date, "yyyy-MM-dd")
    setEvents((prev) => {
      const prevEvents = prev[key] || []
      return { ...prev, [key]: [...prevEvents, eventObj] } //the one line I don't fully understand
    })
  }

  function deleteEvent(date, index) {
    const key = format(date, "yyyy-MM-dd")
    setEvents((prev) => {
      const prevEvents = prev[key] || []
      return { ...prev, [key]: prevEvents.filter((_, i) => i !== index) }
    })
  }

  return (
    <EventsContext.Provider value={{ events, getEventsForDate, addEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  return useContext(EventsContext)
}

//
// -------------------- DATES CONTEXT (calendar navigation) --------------------
//
export const DatesContext = createContext()

export function NewCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [showEventModule, setShowEventModule] = useState(false)
  const [selectedEventDate, setSelectedEventDate] = useState()

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(visibleMonth)),
    end: endOfWeek(endOfMonth(visibleMonth)),
  })

  function showPreviousMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))
  }

  function showNextMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))
  }

  return (
    // wrap entire calendar in EventsProvider for global storage access  // NEW
    <EventsProvider>
      <DatesContext.Provider
        value={{
          visibleMonth,
          setVisibleMonth,
          visibleDates,
          showEventModule,
          setShowEventModule,
          selectedEventDate,
          setSelectedEventDate,
        }}>
        <div className='calendar'>
          {/* NAV */}
          <div className='calendar-nav'>
            <button onClick={() => setVisibleMonth(new Date())}>Today</button>
            <button className='nav-arrow-button' onClick={showPreviousMonth}>
              {"<"}
            </button>
            <button className='nav-arrow-button' onClick={showNextMonth}>
              {">"}
            </button>
            <span className='month-header'>{format(visibleMonth, "MMMM yyyy")}</span>
          </div>

          {/* MONTH-DISPLAY */}
          <div className='month-container'>
            {visibleDates.map((date, index) => (
              <EachDate key={date.toDateString()} index={index} date={date} />
            ))}
          </div>

          <EventModule />
        </div>
      </DatesContext.Provider>
    </EventsProvider>
  )
}

function EachDate({ date, index }) {
  const { visibleMonth, setShowEventModule, setSelectedEventDate } = useContext(DatesContext)
  const { getEventsForDate } = useEvents() // NEW // getEventsForDate is destructed from the useEvents function, which returns a bunch of EventsContexts

  const row = Math.floor(index / 7)
  const col = index % 7
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // --- Get and sort events for this date ---
  const events = getEventsForDate(date)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.eventAllday && !b.eventAllday) return -1
    if (!a.eventAllday && b.eventAllday) return 1
    if (a.eventAllday && b.eventAllday) return 0
    return a.eventTimes.start.localeCompare(b.eventTimes.start)
  })

  return (
    <div className={`date ${!isSameMonth(date, visibleMonth) && "out-of-month-day"} `}>
      <button
        onClick={() => {
          setShowEventModule(true)
          setSelectedEventDate(date)
        }}
        className='add-event-btn'>
        +
      </button>

      <div className='date-header'>
        {row === 0 && <div className='weekday-label'>{weekdayLabels[col]} </div>}
        <div
          className={`date-num ${isToday(date) && "today"} ${
            isPast(date) && !isToday(date) && "prev-day"
          }`}>
          {date.getDate()}
        </div>
      </div>

      {/* --- Events display --- */}
      <div className='events-list'>
        {sortedEvents.map((event, i) => (
          <button
            onClick={() => {
              setShowEventModule(true)
              setSelectedEventDate(date) /* MAKE SURE THIS UPDATES SELECTED EVENT, NOT ADD NEW ONE*/
            }}
            key={i}
            className={`calendar-event ${event.eventAllday ? "allday-event" : "timed-event"}
             ${event.eventColor}-event`}
            // style={{ backgroundColor: event.eventColor }}
          >
            {event.eventAllday ? (
              <span className='event-name'>{event.eventName}</span>
            ) : (
              <>
                <span className='event-dot'>●</span>
                <span className='event-time'>{event.eventTimes.start}</span>
                <span className='event-name'>{event.eventName}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

//
// -------------------- EVENT MODULE --------------------
//
function EventModule() {
  const { showEventModule, setShowEventModule, selectedEventDate } = useContext(DatesContext)
  const { addEvent } = useEvents() // NEW: useEvents hook

  // event form state
  const [eventData, setEventData] = useState({
    eventName: "",
    allday: false, // NEW: strict boolean
    startTime: "",
    endTime: "",
    color: "red", // default is always valid
  })

  // handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEventDate) return

    // ---- VALIDATION RULES ----
    if (!eventData.eventName.trim()) {
      alert("Event name is required.")
      return
    }

    if (!eventData.allday) {
      if (!eventData.startTime || !eventData.endTime) {
        alert("Start and End times are required if event is not all-day.")
        return
      }
      if (eventData.endTime <= eventData.startTime) {
        alert("End time must be later than start time.")
        return
      }
    }

    // save to global storage
    addEvent(selectedEventDate, {
      eventName: eventData.eventName,
      eventAllday: eventData.allday,
      eventTimes: eventData.allday ? null : { start: eventData.startTime, end: eventData.endTime },
      eventColor: eventData.color,
    })

    // close modal + reset form
    setShowEventModule(false)
    setEventData({ eventName: "", allday: false, startTime: "", endTime: "", color: "red" })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <>
      <div className={`overlay ${showEventModule && "show"}`} />
      <div className={`event-module ${showEventModule && "show"}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Add Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, "MM/dd/yy") : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => setShowEventModule(false)}>
            x
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          {/* Event Name */}
          <div className='event-label'>
            <label className='name'>
              Name
              <br />
              <input
                type='text'
                name='eventName'
                value={eventData.eventName}
                onChange={handleChange}
                required // NEW: input-level requirement
              />
            </label>
          </div>

          {/* All Day Checkbox */}
          <div className='event-label'>
            <label className='allday'>
              <input
                type='checkbox'
                name='allday'
                checked={eventData.allday}
                onChange={handleChange}
              />
              All Day?
            </label>
          </div>

          {/* Start/End Times (disabled when allday) */}
          <div className='event-label event-times'>
            <label className='event-time'>
              Start Time
              <br />
              <input
                type='time'
                name='startTime'
                value={eventData.startTime}
                onChange={handleChange}
                disabled={eventData.allday} // NEW
                required={!eventData.allday} // NEW
              />
            </label>
            <label className='event-time'>
              End Time
              <br />
              <input
                type='time'
                name='endTime'
                value={eventData.endTime}
                onChange={handleChange}
                disabled={eventData.allday} // NEW
                required={!eventData.allday} // NEW
              />
            </label>
          </div>

          {/* Color Selection */}
          <div className='event-label'>
            <label className='color'>
              Color
              <br />
              <div className='radio-group'>
                <input
                  type='radio'
                  id='red'
                  name='color'
                  value='red'
                  checked={eventData.color === "red"}
                  onChange={handleChange}
                />
                <input
                  type='radio'
                  id='green'
                  name='color'
                  value='green'
                  checked={eventData.color === "green"}
                  onChange={handleChange}
                />
                <input
                  type='radio'
                  id='blue'
                  name='color'
                  value='blue'
                  checked={eventData.color === "blue"}
                  onChange={handleChange}
                />
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className='event-submit-btn-section'>
            <button className='event-submit-btn' type='submit'>
              Add
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
