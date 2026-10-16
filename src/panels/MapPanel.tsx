import { Panel, PanelHeader } from '@vkontakte/vkui'
import { Picture } from '../components/Picture.tsx'

type MapPanelProps = {
  id: string
}

export function MapPanel({ id }: MapPanelProps) {
  return (
    <Panel id={id} className="map-screen">
      <PanelHeader>Карта</PanelHeader>
      <Picture
        className="map-screen__preview"
        alt="Превью маршрута гонки «Авача»"
        ratio="9 / 16"
      />
      <p className="map-screen__caption">Карта скоро появится</p>
    </Panel>
  )
}
