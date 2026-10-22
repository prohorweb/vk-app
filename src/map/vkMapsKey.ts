/** Ключ VK Карт: официальный npm `mmr-gl`, токен задаётся через mmrgl.accessToken (dev.vk.com/vkmaps). */
export function readVkMapsKey(): string | undefined {
  const key = import.meta.env.VITE_VK_MAPS_KEY?.trim()
  if (key) {
    return key
  }
  const legacy = import.meta.env.VITE_VK_MAPS_ACCESS_TOKEN?.trim()
  return legacy || undefined
}

export function hasVkMapsKey(): boolean {
  return Boolean(readVkMapsKey())
}
