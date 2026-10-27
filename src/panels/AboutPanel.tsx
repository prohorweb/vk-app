import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { Picture } from '../components/Picture.tsx'
import { useDragScroll } from '../hooks/useDragScroll.ts'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { publicImage } from '../lib/publicImage.ts'

type AboutPanelProps = {
  id: string
}

type AboutPhoto = {
  file: string
  alt: string
}

const FIRST_GALLERY: AboutPhoto[] = [
  { file: 'about/photo-1.jpg', alt: 'Каюр на нартах поднимает снежную пыль на трассе' },
  { file: 'about/photo-2.jpg', alt: 'Упряжка хаски на старте гонки' },
  { file: 'about/photo-3.jpg', alt: 'Зрители и участники на стартовой площадке' },
  { file: 'about/photo-4.jpg', alt: 'Двое участников гонки в зимней экипировке' },
]

const SECOND_GALLERY: AboutPhoto[] = [
  { file: 'about/photo-5.jpg', alt: 'Собачья упряжка на склоне под ярким солнцем' },
  { file: 'about/photo-6.jpg', alt: 'Участники гонки спускаются по заснеженному склону' },
  { file: 'about/photo-7.jpg', alt: 'Хаски в упряжке крупным планом' },
  { file: 'about/photo-8.jpg', alt: 'Упряжка на фоне заснеженных гор' },
]

function PhotoGallery({ label, photos }: { label: string; photos: AboutPhoto[] }) {
  const dragProps = useDragScroll<HTMLDivElement>()

  return (
    <div className="about-gallery" role="group" aria-label={label} {...dragProps}>
      {photos.map((photo) => (
        <Picture
          key={photo.file}
          className="about-gallery__item"
          src={publicImage(photo.file)}
          alt={photo.alt}
          ratio="450 / 281"
        />
      ))}
    </div>
  )
}

export function AboutPanel({ id }: AboutPanelProps) {
  const goBack = useMoreSectionBack()

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        О гонке
      </PanelHeader>
      <Picture
        className="about-hero"
        src={publicImage('about/hero.jpg')}
        alt="Собачья упряжка на заснеженной равнине, баннер гонки «Авача»"
        ratio="720 / 490"
      />
      <div className="about-content">
        <h1 className="about-title">«Авача»</h1>
        <p className="about-lead">
          Физкультурно-туристическое мероприятие по ездовому спорту «Авача» — всероссийская
          гонка, проходящая на Камчатке в рамках зимнего фестиваля «Авача» при поддержке
          Правительства Камчатского края и Федерации развития ездового спорта, объединяющая
          спорт, туризм, культуру и традиции региона.
        </p>
        <p className="about-text">
          Гонка «Авача» является самой сложной гонкой в России и одной из самых сложных в мире.
          Единственная горная гонка, маршрут которой проходит у подножия действующих вулканов.
          Участие принимают только опытные сильнейшие спортсмены страны по ездовому спорту,
          выступающие в дисциплине на длинные дистанции.
        </p>
        <PhotoGallery label="Фотографии с трассы" photos={FIRST_GALLERY} />
        <p className="about-text">
          Маршрут пролегает через живописные горные перевалы и территорию природного парка
          «Налычево», требуя от команды выносливости и грамотной тактики. Гонка длится 6 дней,
          включая ночной этап. Общая протяжённость примерно 300 км, суммарный набор высоты —
          более 4000 метров. Трасса сочетает равнины, затяжные подъёмы и спуски с нестабильной
          погодой, что предъявляет повышенные требования к снаряжению и подготовке собак.
          Ежегодно интерес к гонке растёт как у каюров Камчатского края, так и у участников из
          других субъектов Российской Федерации. Кроме того, желание участвовать изъявили
          представители иностранных государств — это Эстония, Чехия, Италия, Финляндия и
          Германия.
        </p>
        <PhotoGallery label="Фотографии с дистанции" photos={SECOND_GALLERY} />
        <p className="about-text">
          Участие в гонке «Авача» — это возможность испытать себя в суровых условиях Камчатского
          края, пройти путь длиной около 300 км по заснеженным вершинам природного парка вокруг
          вулканов, познакомиться с дикой природой Камчатки и единомышленниками из разных уголков
          страны.
        </p>
      </div>
    </Panel>
  )
}
