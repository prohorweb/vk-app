export function publicImage(name: string): string {
  return `${import.meta.env.BASE_URL}images/${name}`
}

/**
 * Root-absolute `/media/...` (and similar) break under GitHub project Pages
 * (`/vk-app/…`). Rebase them onto Vite `BASE_URL` when it is not `/`.
 */
export function resolvePublicUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  if (!url.startsWith('/')) return url
  const base = import.meta.env.BASE_URL
  if (base === '/' || base === '') return url
  return `${base}${url.slice(1)}`
}
