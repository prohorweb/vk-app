/** «2 мес. 3 д.» — до старта гонки. */
export function countdownLabel(ms: number): string {
  if (ms <= 0) {
    return '0 д.'
  }
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const months = Math.floor(days / 30)
  if (months > 0) {
    return `${months} мес. ${days % 30} д.`
  }
  if (days > 0) {
    return `${days} д.`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours} ч. ${minutes} мин.`
  }
  return `${minutes} мин.`
}
