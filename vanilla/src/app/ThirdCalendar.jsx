import { CalendarProvider } from "../contexts/CalendarContext"
import Nav from "../components/Nav"
import MonthlyGrid from "../components/MonthlyGrid"
import EventModal from "../components/AddEventModal"
import EditEventModal from "../components/EditEventModal"

export function ThirdCalendar() {
  return (
    <CalendarProvider>
      <div className='calendar'>
        <Nav />
        <MonthlyGrid />
        <EventModal />
        <EditEventModal></EditEventModal>
      </div>
    </CalendarProvider>
  )
}
