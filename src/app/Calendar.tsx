import { format } from "date-fns"
import { CalendarProvider, useCalendar } from "../contexts/CalendarContext"
import { DateCell } from "../components/dateCell/DateCell"
import { AddEventModal } from "../components/eventModals/AddEventModal"
import { EditEventModal } from "../components/eventModals/EditEventModal"
import { OverflowModal } from "../components/overflowModal/OverflowModal"

export function Calendar() {
  return (
    <CalendarProvider>
      <div className='calendar'>
        <Nav />
        <MonthlyGrid />
        <AddEventModal />
        <EditEventModal />
        <OverflowModal />
      </div>
    </CalendarProvider>
  )
}

export function Nav() {
  const {
    ui: { visibleMonth, setVisibleMonth, showPreviousMonth, showNextMonth },
  } = useCalendar()

  return (
    <nav className='calendar-nav'>
      <button onClick={() => setVisibleMonth(new Date())}>Today</button>

      <button className='nav-arrow-button' onClick={showPreviousMonth}>
        {"<"}
      </button>
      <button className='nav-arrow-button' onClick={showNextMonth}>
        {">"}
      </button>

      <span className='nav-month-header'>{format(visibleMonth, "MMMM yyyy")}</span>
    </nav>
  )
}

export function MonthlyGrid() {
  const {
    ui: { visibleDates },
  } = useCalendar()

  return (
    <>
      <main className='month-container' tabIndex={0}>
        {visibleDates.map((date: Date, index: number) => (
          <DateCell key={date.toDateString()} date={date} index={index} />
        ))}
      </main>
    </>
  )
}
