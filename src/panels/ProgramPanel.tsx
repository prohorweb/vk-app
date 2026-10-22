import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon24CameraOutline,
  Icon24ChevronDown,
  Icon24ChevronRight,
  Icon24MarketOutline,
  Icon24PictureOutline,
  Icon24SongOutline,
} from '@vkontakte/icons'
import { Button, Panel, PanelHeader } from '@vkontakte/vkui'
import {
  defaultProgramDayId,
  programAllDayZones,
  programDayTitle,
  programDays,
  programEventsForDay,
  programRaceCard,
  type ProgramAllDayZone,
} from '../api/mocks/program.ts'
import startLogo from '../assets/start/logo.png'
import { PATH } from '../routes.ts'

const VISIBLE_EVENTS = 2

type ProgramPanelProps = {
  id: string
}

function zoneIcon(zone: ProgramAllDayZone) {
  if (zone.icon === 'stage') {
    return <Icon24SongOutline />
  }
  if (zone.icon === 'food') {
    return <Icon24MarketOutline />
  }
  if (zone.icon === 'photo') {
    return <Icon24CameraOutline />
  }
  return <Icon24PictureOutline />
}

export function ProgramPanel({ id }: ProgramPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [dayId, setDayId] = useState(defaultProgramDayId)
  const [expanded, setExpanded] = useState(false)

  const events = programEventsForDay(dayId)
  const hiddenCount = Math.max(0, events.length - VISIBLE_EVENTS)
  const visibleEvents = expanded ? events : events.slice(0, VISIBLE_EVENTS)

  return (
    <Panel id={id} className="program-screen">
      <PanelHeader>Программа</PanelHeader>
      <div className="program-screen__body">
        <section className="program-race-card">
          <img className="program-race-card__logo" src={startLogo} alt="" width={48} height={48} />
          <div className="program-race-card__text">
            <h2 className="program-race-card__title">{programRaceCard.title}</h2>
            <p className="program-race-card__meta">{programRaceCard.meta}</p>
            <p className="program-race-card__dates">{programRaceCard.dates}</p>
          </div>
        </section>

        <div className="program-days" role="tablist" aria-label="Дни программы">
          {programDays.map((day) => (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={dayId === day.id}
              className={['program-days__chip', dayId === day.id ? 'program-days__chip--active' : ''].join(' ')}
              onClick={() => {
                setDayId(day.id)
                setExpanded(false)
              }}
            >
              <span className="program-days__day">{day.day}</span>
              <span className="program-days__weekday">{day.weekday}</span>
            </button>
          ))}
        </div>

        <section className="program-day-card">
          <div className="program-day-card__head">
            <h3 className="program-day-card__title">{programDayTitle(dayId)}</h3>
            <span className="program-day-card__count">{events.length} событий</span>
          </div>
          <ul className="program-events">
            {visibleEvents.map((event) => (
              <li key={event.id} className="program-events__row">
                <span className="program-events__time">{event.time}</span>
                <div className="program-events__body">
                  <p className="program-events__name">{event.title}</p>
                  <p className="program-events__place">{event.place}</p>
                </div>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && !expanded ? (
            <button type="button" className="program-events__more" onClick={() => setExpanded(true)}>
              Показать ещё {hiddenCount} событий <Icon24ChevronDown />
            </button>
          ) : null}
        </section>

        <section className="program-all-day">
          <h3 className="program-all-day__title">Работает весь день</h3>
          <div className="program-all-day__grid">
            {programAllDayZones.map((zone) => (
              <div key={zone.id} className="program-all-day__tile">
                <span className="program-all-day__icon">{zoneIcon(zone)}</span>
                <span>{zone.title}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="program-screen__footer">
        <Button
          size="l"
          stretched
          mode="primary"
          after={<Icon24ChevronRight />}
          onClick={() => void routeNavigator.push(PATH.spectatorMap)}
        >
          Карта зрительских локаций
        </Button>
      </div>
    </Panel>
  )
}
