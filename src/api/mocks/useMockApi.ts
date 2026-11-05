/** Presentation / GitHub Pages: all public data comes from demo fixtures. */
export const useMockApi = import.meta.env.VITE_USE_MOCK === 'true'

/** Show demo scenarios menu in local DEV or mock presentation builds. */
export const showDevScenariosMenu = import.meta.env.DEV || useMockApi
