/** Время положения: для сегодняшней отметки — только часы и минуты, иначе с датой. */
export function formatMapPositionTime(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const sameDay = date.toDateString() === now.toDateString()
  return new Intl.DateTimeFormat('ru-RU', {
    ...(sameDay ? {} : { day: '2-digit', month: '2-digit' }),
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
