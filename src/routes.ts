import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router'

export const ROOT = 'root'

export const VIEW_START = 'view_start'
export const VIEW_MAP = 'view_map'
export const VIEW_PARTICIPANTS = 'view_participants'
export const VIEW_RESULTS = 'view_results'
export const VIEW_PROGRAM = 'view_program'
export const VIEW_MORE = 'view_more'

export const PANEL_START = 'panel_start'
export const PANEL_MAP = 'panel_map'
export const PANEL_MAP_PARTICIPANT = 'panel_map_participant'
export const PANEL_PARTICIPANTS = 'panel_participants'
export const PANEL_PARTICIPANT = 'panel_participant'
export const PANEL_RESULTS = 'panel_results'
export const PANEL_ROUTE = 'panel_route'
export const PANEL_PROGRAM = 'panel_program'
export const PANEL_SPECTATOR_MAP = 'panel_spectator_map'
export const PANEL_MEDIA = 'panel_media'
export const PANEL_GUESTS = 'panel_guests'
export const PANEL_GUESTS_TRANSPORT = 'panel_guests_transport'
export const PANEL_GUESTS_PACKING = 'panel_guests_packing'
export const PANEL_GUESTS_SAFETY = 'panel_guests_safety'
export const PANEL_GUESTS_FAQ = 'panel_guests_faq'
export const PANEL_GUESTS_CONTACTS = 'panel_guests_contacts'
export const PANEL_PROFILE = 'panel_profile'
export const PANEL_ABOUT = 'panel_about'

export const PATH = {
  start: '/',
  map: '/map',
  results: '/results',
  participants: '/participants',
  media: '/media',
  route: '/more/route',
  program: '/more/program',
  spectatorMap: '/more/program/spectator',
  guests: '/more/guests',
  guestsTransport: '/more/guests/transport',
  guestsPacking: '/more/guests/packing',
  guestsSafety: '/more/guests/safety',
  guestsFaq: '/more/guests/faq',
  guestsContacts: '/more/guests/contacts',
  about: '/more/about',
  profile: '/more/profile',
} as const

export const MORE_MENU_PANELS = [
  PANEL_PROFILE,
  PANEL_ABOUT,
  PANEL_ROUTE,
  PANEL_GUESTS,
  PANEL_GUESTS_TRANSPORT,
  PANEL_GUESTS_PACKING,
  PANEL_GUESTS_SAFETY,
  PANEL_GUESTS_FAQ,
  PANEL_GUESTS_CONTACTS,
  PANEL_MEDIA,
] as const

export const routes = RoutesConfig.create([
  createRoot(ROOT, [
    createView(VIEW_START, [createPanel(PANEL_START, PATH.start)]),
    createView(VIEW_MAP, [
      createPanel(PANEL_MAP, PATH.map),
      createPanel(PANEL_MAP_PARTICIPANT, '/map/:participantId', [], ['participantId'] as const),
    ]),
    createView(VIEW_PARTICIPANTS, [
      createPanel(PANEL_PARTICIPANTS, PATH.participants),
      createPanel(PANEL_PARTICIPANT, '/participants/:participantId', [], [
        'participantId',
      ] as const),
    ]),
    createView(VIEW_RESULTS, [createPanel(PANEL_RESULTS, PATH.results)]),
    createView(VIEW_PROGRAM, [
      createPanel(PANEL_PROGRAM, PATH.program),
      createPanel(PANEL_SPECTATOR_MAP, PATH.spectatorMap),
    ]),
    createView(VIEW_MORE, [
      createPanel(PANEL_ROUTE, PATH.route),
      createPanel(PANEL_MEDIA, PATH.media),
      createPanel(PANEL_GUESTS, PATH.guests),
      createPanel(PANEL_GUESTS_TRANSPORT, PATH.guestsTransport),
      createPanel(PANEL_GUESTS_PACKING, PATH.guestsPacking),
      createPanel(PANEL_GUESTS_SAFETY, PATH.guestsSafety),
      createPanel(PANEL_GUESTS_FAQ, PATH.guestsFaq),
      createPanel(PANEL_GUESTS_CONTACTS, PATH.guestsContacts),
      createPanel(PANEL_ABOUT, PATH.about),
      createPanel(PANEL_PROFILE, PATH.profile),
    ]),
  ]),
])

export const router = createHashRouter(routes.getRoutes())
