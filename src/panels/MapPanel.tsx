import { Panel, PanelHeader } from '@vkontakte/vkui'
import { Picture } from '../components/Picture.tsx'
import { publicImage } from '../lib/publicImage.ts'

type MapPanelProps = {
  id: string
}

export function MapPanel({ id }: MapPanelProps) {
  return (
    <Panel id={id} className="map-screen">
      <PanelHeader>Карта</PanelHeader>
      <Picture
        className="map-screen__preview"
        src={publicImage('map-base.png')}
        alt="Топографическая карта маршрута гонки «Авача»"
        ratio="1824 / 1344"
        fit="cover"
        position="center center"
      />
      <p className="map-screen__caption">Карта скоро появится</p>
    </Panel>
  )
}
