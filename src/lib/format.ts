export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}min` : `${minutes} min`;
}

export function formatBRL(value: number) {
  const [integer, cents] = (Number.isFinite(value) ? value : 0).toFixed(2).split('.');
  return `R$ ${integer!.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
}
