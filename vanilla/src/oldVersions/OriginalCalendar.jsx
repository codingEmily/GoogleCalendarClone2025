import { useEffect, useState, createContext, useContext } from "react"
// import { Link } from "react-router-dom"
// import { useForm, SubmitHandler } from "react-hook-form"
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
  setSeconds,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns"

export const DatesContext = createContext()

export function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [showEventModule, setShowEventModule] = useState(false)
  const [selectedEventDate, setSelectedEventDate] = useState()

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(visibleMonth)),
    end: endOfWeek(endOfMonth(visibleMonth)),
  })

  function showPreviousMonth() {
    setVisibleMonth((currentMonth) => {
      return addMonths(currentMonth, -1)
    })
  }

  function showNextMonth() {
    setVisibleMonth((currentMonth) => {
      return addMonths(currentMonth, 1)
    })
  }
  return (
    <>
      {" "}
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
            <button
              onClick={() => {
                setVisibleMonth(new Date())
              }}>
              Today
            </button>
            <button className='nav-arrow-button' onClick={showPreviousMonth}>
              {"<"}
            </button>
            <button className='nav-arrow-button' onClick={showNextMonth}>
              {">"}
            </button>
            <span className='month-header'>{format(visibleMonth, "MMMM yyyy")}</span>
          </div>

          {/* MONTH-DISPLAY  */}
          <div className='month-container'>
            {visibleDates.map((date, index) => (
              <EachDate key={date.toDateString()} index={index} date={date}></EachDate>
            ))}
          </div>
          <EventModule></EventModule>
        </div>
      </DatesContext.Provider>
    </>
  )
}

///date, visibleMonth
function EachDate({ date, index }) {
  const {
    visibleDates,
    visibleMonth,
    setVisibleMonth,
    showEventModule,
    setShowEventModule,
    selectedEventDate,
    setSelectedEventDate,
  } = useContext(DatesContext)

  const row = Math.floor(index / 7)
  const col = index % 7 // returns the exact REMAINDER of {index / 7} >>> IDK how the deimals convert to the whole numbers needed to be used as indices for weekdayLabels tho
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  return (
    <>
      <div className={`date ${!isSameMonth(date, visibleMonth) && "out-of-month-day"} `}>
        <button
          onClick={() => {
            setShowEventModule((bool) => !bool)
            setSelectedEventDate(date)
            console.log("+ event btn clicked")
          }}
          className='add-event-btn'>
          +
        </button>
        {/* {console.log("render", date)} */}
        <div className='date-header'>
          {row === 0 && <div className='weekday-label'>{weekdayLabels[col]} </div>}

          <div
            className={`date-num ${isToday(date) && "today"} ${
              isPast(date) && !isToday(date) && "prev-day"
            }`}>
            {date.getDate()}
          </div>
        </div>
      </div>
    </>
  )
}

// //////////// EVENT MODULE
function EventModule() {
  const {
    visibleDates,
    visibleMonth,
    setVisibleMonth,
    showEventModule,
    setShowEventModule,
    selectedEventDate,
    setSelectedEventDate,
  } = useContext(DatesContext)

  const [eventData, setEventData] = useState({
    eventName: "",
    allday: "checked" || "unchecked",
    startTime: Number || null,
    endTime: Number || null,
    color: "red" || "blue" || "green",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowEventModule((showEventModule) => {
      !showEventModule
    })
    console.log("submitted eventData: ", eventData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <>
      <div className={`overlay ${showEventModule && "show"}`}></div>
      <div className={`event-module ${showEventModule && "show"}`}>
        <div className='event-module-header'>
          <span className='event-module-header-name'>Add Event</span>
          <span className='event-module-header-date'>
            {selectedEventDate ? format(selectedEventDate, "MM/dd/yy") : ""}
          </span>
          <button
            className='event-module-header-close-btn'
            onClick={() => {
              setShowEventModule((showEventModule) => {
                !showEventModule
              })
            }}>
            x
          </button>
        </div>

        <form className='form' onSubmit={handleSubmit}>
          <div className='event-label'>
            <label className='name'>
              Name
              <br></br>
              <input type='text' value={eventData.eventName} onChange={handleChange}></input>
            </label>
          </div>

          <div className='event-label'>
            <label className='allday'>
              <input type='checkbox' value={eventData.allday} onChange={handleChange}></input>
              All Day?
            </label>
          </div>

          <div className='event-label event-times'>
            <label className='event-time'>
              Start Time
              <br></br>
              <input type='time'></input>
            </label>
            <label className='event-time'>
              End Time
              <br></br>
              <input type='time'></input>
            </label>
          </div>

          <div className='event-label'>
            <label className='color'>
              Color
              <br></br>
              <div className=' radio-group'>
                <input
                  className='radio-btn'
                  hidden
                  type='radio'
                  id='red'
                  name='color'
                  value={eventData.color}
                  onChange={handleChange}></input>
                <input
                  className='radio-btn'
                  hidden
                  type='radio'
                  id='green'
                  name='color'
                  value={eventData.color}
                  onChange={handleChange}></input>
                <input
                  className='radio-btn'
                  hidden
                  type='radio'
                  id='blue'
                  name='color'
                  value={eventData.color}
                  onChange={handleChange}></input>
              </div>
            </label>
          </div>

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
