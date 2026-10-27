import { publicImage } from '../../lib/publicImage.ts'
import type { FAQItem } from '../../types/index.ts'

export type GuestsIconId =
  | 'place'
  | 'plane'
  | 'ticket'
  | 'compass'
  | 'home'
  | 'cloud'
  | 'snowflake'
  | 'pulse'
  | 'flag'
  | 'warning'
  | 'gift'
  | 'chart'
  | 'health'
  | 'fire'
  | 'sun'
  | 'question'
  | 'mail'
  | 'comment'
  | 'globe'
  | 'vk'
  | 'mention'

export type GuestsCard = {
  id: 'transport' | 'packing' | 'safety' | 'faq' | 'contacts'
  title: string
  subtitle: string
  icon: GuestsIconId
}

export type GuestsTip = {
  id: string
  title: string
  text: string
  icon: GuestsIconId
}

export type GuestsPackingTab = {
  id: 'clothes' | 'shoes' | 'gear'
  label: string
  photo: string
  items: GuestsTip[]
}

export type GuestsContact = {
  id: string
  icon: GuestsIconId
  title: string
  subtitle: string
  href: string
}

export type GuestsContactGroup = {
  id: 'contact' | 'social'
  title: string
  items: GuestsContact[]
}

export const guestsHero = publicImage('about/hero.jpg')

/** Карточки списка раздела «Гостям». */
export const guestsCards: GuestsCard[] = [
  { id: 'transport', title: 'Как добраться', subtitle: 'Транспорт и маршруты', icon: 'place' },
  { id: 'packing', title: 'Что взять с собой', subtitle: 'Одежда, снаряжение', icon: 'compass' },
  { id: 'safety', title: 'Безопасность зимой', subtitle: 'Рекомендации', icon: 'snowflake' },
  { id: 'faq', title: 'FAQ', subtitle: 'Ответы на частые вопросы', icon: 'question' },
  { id: 'contacts', title: 'Контакты организатора', subtitle: 'Телефон и почта', icon: 'mail' },
]

/** Эндпоинтов для этих разделов в API нет — тексты и фото живут в моках. */
export const guestsTransportPhoto = publicImage('about/photo-5.jpg')
export const guestsSafetyPhoto = publicImage('about/photo-7.jpg')
export const guestsContactsPhoto = publicImage('about/photo-3.jpg')

export const guestsTransportTips: GuestsTip[] = [
  {
    id: 'where',
    icon: 'place',
    title: 'Где находится Камчатка',
    text: 'Камчатка — полуостров на северо-востоке России. Омывается Тихим океаном, Охотским и Беринговым морями. Административный центр — Петропавловск-Камчатский.',
  },
  {
    id: 'how',
    icon: 'plane',
    title: 'Как добраться до полуострова',
    text: 'Самолётом до аэропорта Петропавловск-Камчатский (PKC): рейсы из Москвы идут около 8,5 часа, есть перелёты из Владивостока, Хабаровска и Новосибирска. Из Владивостока в Петропавловск-Камчатский ходит паром.',
  },
  {
    id: 'tickets',
    icon: 'ticket',
    title: 'Как купить самые дешёвые билеты',
    text: 'Покупайте за 2–3 месяца до поездки, следите за распродажами и рассматривайте перелёт с пересадкой в Новосибирске или Хабаровске — он часто дешевле прямого.',
  },
  {
    id: 'transport',
    icon: 'compass',
    title: 'Каким транспортом можно воспользоваться',
    text: 'По городу ходят автобусы и такси. До стартовых и финишных площадок этапов организуют трансферы — их расписание публикуется в разделе «Программа». К вулканам ездят на внедорожниках и вертолётах.',
  },
  {
    id: 'stay',
    icon: 'home',
    title: 'Где можно остановиться',
    text: 'В Петропавловске-Камчатском — гостиницы, хостелы и гостевые дома. Рядом с трассой — базы отдыха в Паратунке, что удобно, если вы приезжаете на несколько этапов.',
  },
]

export const guestsPackingTabs: GuestsPackingTab[] = [
  {
    id: 'clothes',
    label: 'Одежда',
    photo: publicImage('about/photo-4.jpg'),
    items: [
      {
        id: 'layer-1',
        icon: 'snowflake',
        title: 'Первый слой',
        text: 'Качественное термобельё (синтетика или шерсть мериноса), которое отводит влагу.',
      },
      {
        id: 'layer-2',
        icon: 'snowflake',
        title: 'Второй слой',
        text: 'Плотная флисовая кофта или свитер из шерсти.',
      },
      {
        id: 'layer-3',
        icon: 'snowflake',
        title: 'Верхний слой',
        text: 'Тёплая пуховая куртка (пауэр-парка) с глубоким капюшоном и непродуваемые утеплённые штаны (лучше мембранные).',
      },
      {
        id: 'head',
        icon: 'snowflake',
        title: 'Головной убор и аксессуары',
        text: 'Тёплая шапка, закрывающая уши, флисовый бафф (удобнее шарфа) и тёплые варежки или перчатки.',
      },
      {
        id: 'rest',
        icon: 'snowflake',
        title: 'Для отдыха',
        text: 'Купальник и лёгкие тапочки — зимой на Камчатке популярны купания в термальных источниках под открытым небом.',
      },
    ],
  },
  {
    id: 'shoes',
    label: 'Обувь',
    photo: publicImage('about/photo-1.jpg'),
    items: [
      {
        id: 'city',
        icon: 'home',
        title: 'Для города и полноценных прогулок',
        text: 'Кожаные утеплённые ботинки или высокие сапоги с толстой нескользящей подошвой (из термопластичной резины или с глубоким протектором). Утеплитель — натуральный мех или плотная шерсть. Обувь должна быть высокой, выше щиколотки.',
      },
      {
        id: 'active',
        icon: 'flag',
        title: 'Для активного отдыха, экскурсий',
        text: 'Специализированные зимние или экспедиционные ботинки с хорошим температурным запасом. Сапоги из ЭВА с тёплыми многослойными вкладышами незаменимы в сильный мороз и при поездках на снегоходах. Высокие треккинговые ботинки с мембраной (Gore-Tex) и утеплителем пригодятся на утоптанном снегу.',
      },
      {
        id: 'extra',
        icon: 'sun',
        title: 'Дополнительная обувь',
        text: 'Лёгкие кроссовки или тапочки для помещений и отеля. Сланцы пригодятся, если планируете купание в термальных источниках.',
      },
    ],
  },
  {
    id: 'gear',
    label: 'Снаряжение',
    photo: publicImage('about/photo-2.jpg'),
    items: [
      {
        id: 'powerbank',
        icon: 'chart',
        title: 'Мощный Powerbank',
        text: 'На холоде аккумуляторы разряжаются очень быстро. Держите пауэрбанк во внутреннем кармане ближе к теплу.',
      },
      {
        id: 'thermos',
        icon: 'fire',
        title: 'Термос',
        text: 'Горячий чай или морс на маршруте, во время катания на снегоходах или поездки к вулканам.',
      },
      {
        id: 'glasses',
        icon: 'sun',
        title: 'Солнцезащитные очки',
        text: 'Зимой солнце отражается от снега и светит очень ярко, ультрафиолет сильный.',
      },
      {
        id: 'balm',
        icon: 'health',
        title: 'Гигиеническая помада и жирный защитный крем',
        text: 'От мороза и ветра губы и лицо обветриваются мгновенно.',
      },
      {
        id: 'kit',
        icon: 'warning',
        title: 'Аптечка',
        text: 'Базовый набор лекарств и таблетки от укачивания.',
      },
    ],
  },
]

export const guestsSafetyTips: GuestsTip[] = [
  {
    id: 'weather',
    icon: 'cloud',
    title: 'Погода и метели',
    text: 'На Камчатке погода меняется за минуты. Следите за прогнозом, не выходите на маршрут в метель и держите телефон заряженным.',
  },
  {
    id: 'avalanche',
    icon: 'snowflake',
    title: 'Лавины',
    text: 'Не выходите на заснеженные склоны без гида и лавинного снаряжения. Перед выходом уточняйте лавинный прогноз.',
  },
  {
    id: 'seismic',
    icon: 'pulse',
    title: 'Сейсмичность',
    text: 'Полуостров — сейсмоактивный регион. При землетрясении выйдите на открытое место и не пользуйтесь лифтом.',
  },
  {
    id: 'isolation',
    icon: 'flag',
    title: 'Изоляция и рельеф',
    text: 'За пределами города связи почти нет. Сообщите близким маршрут и время возвращения, берите навигатор и запас еды.',
  },
  {
    id: 'general',
    icon: 'warning',
    title: 'Риски вне зависимости от сезона',
    text: 'Медведи, кипящие источники, обрывы: не сходите с размеченных троп и не подходите к диким животным.',
  },
]

export const guestsContacts: GuestsContactGroup[] = [
  {
    id: 'contact',
    title: 'Связаться',
    items: [
      {
        id: 'mail',
        icon: 'mail',
        title: 'info@sleddog-russia.ru',
        subtitle: 'Написать на почту',
        href: 'mailto:info@sleddog-russia.ru',
      },
      {
        id: 'messages',
        icon: 'comment',
        title: 'Сообщения сообщества',
        subtitle: 'Ответим во ВКонтакте',
        href: 'https://vk.me/avacha.race',
      },
    ],
  },
  {
    id: 'social',
    title: 'Мы в соцсетях',
    items: [
      {
        id: 'site',
        icon: 'globe',
        title: 'https://sleddog-russia.ru/',
        subtitle: 'Сайт федерации ездового спорта',
        href: 'https://sleddog-russia.ru/',
      },
      {
        id: 'vk',
        icon: 'vk',
        title: 'https://vk.ru/avacha.race',
        subtitle: 'Сообщество гонки',
        href: 'https://vk.ru/avacha.race',
      },
      {
        id: 'mention',
        icon: 'mention',
        title: 'avacha.race',
        subtitle: 'Короткий адрес сообщества',
        href: 'https://vk.ru/avacha.race',
      },
    ],
  },
]

/** Fallback для экрана FAQ, когда API недоступен. */
export const guestsFaqFallback: FAQItem[] = [
  {
    id: -1,
    question: 'Что привезти с Камчатки?',
    answer:
      'Рыбные деликатесы, икру, краба, вяленую рыбу, кедровые орехи и изделия из меха. Продукты берите в вакуумной упаковке — так их можно везти в багаже.',
    category: 'Сувениры',
    order_index: 0,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -2,
    question: 'Какая связь на Камчатке?',
    answer:
      'В Петропавловске-Камчатском работает мобильная связь и мобильный интернет. За городом и на трассе связи почти нет — предупредите близких и скачайте карты заранее.',
    category: 'Связь',
    order_index: 1,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -3,
    question: 'Какую выбрать медицинскую страховку?',
    answer:
      'Берите полис с покрытием активного отдыха и эвакуацией вертолётом: в отдалённых районах полуострова это единственный способ быстро добраться до больницы.',
    category: 'Страховка',
    order_index: 2,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -4,
    question: 'Что едят на Камчатке?',
    answer:
      'Камчатская кухня — это краб, гребешок, палтус, оленина и местные ягоды. В городе много кафе с рыбными блюдами и супами из морепродуктов.',
    category: 'Кухня',
    order_index: 3,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -5,
    question: 'Где на Камчатке находятся визит-центры?',
    answer:
      'Главный визит-центр работает в Петропавловске-Камчатском, отдельные центры есть в природном парке «Налычево» и у подножия Авачинского вулкана.',
    category: 'Туризм',
    order_index: 4,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -6,
    question: 'Сколько вулканов на Камчатке?',
    answer:
      'На полуострове больше 300 вулканов, около 30 из них действующие. Самые известные — Ключевская сопка, Авачинский и Мутновский вулканы.',
    category: 'Природа',
    order_index: 5,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -7,
    question: 'Можно купаться в океане?',
    answer:
      'В Тихом океане вода холодная даже летом, купаются только подготовленные. Зато в термальных источниках и в бухте с горячими ключами купаться можно и зимой.',
    category: 'Природа',
    order_index: 6,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: -8,
    question: 'Можно увидеть извержение вулкана?',
    answer:
      'Извержения случаются несколько раз в год, но предсказать их заранее нельзя. Следите за сводками и не приближайтесь к действующим вулканам без гида.',
    category: 'Природа',
    order_index: 7,
    updated_at: '2026-02-01T09:00:00.000Z',
  },
]
