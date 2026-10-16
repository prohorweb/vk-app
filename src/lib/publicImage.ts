export function publicImage(name: string): string {
  return `${import.meta.env.BASE_URL}images/${name}`
}
