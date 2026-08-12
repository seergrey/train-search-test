/** Presentation helpers shared by feature components. Pure and unit-tested. */

/** Times are 'HH:mm'; assumes an overnight trip wraps past midnight at most once. */
export function formatDuration(departureTime: string, arrivalTime: string): string {
  const departureMinutes = toMinutes(departureTime);
  const arrivalMinutesRaw = toMinutes(arrivalTime);
  const arrivalMinutes =
    arrivalMinutesRaw < departureMinutes ? arrivalMinutesRaw + 24 * 60 : arrivalMinutesRaw;
  const totalMinutes = arrivalMinutes - departureMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function toMinutes(time: string): number {
  const [hoursPart, minutesPart] = time.split(':');
  return Number(hoursPart ?? 0) * 60 + Number(minutesPart ?? 0);
}

/** Whole euros — the API never returns fractional prices. */
export function formatPrice(price: number): string {
  return `€${price}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}
