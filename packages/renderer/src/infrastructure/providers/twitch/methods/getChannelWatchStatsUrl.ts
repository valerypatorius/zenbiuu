export function getChannelWatchStatsUrl(source: string): string {
  const statsUrl = source.match(/"spade_url":"(.*?)"/)?.[1];

  if (statsUrl === undefined) {
    throw new Error('Failed to locate channel watch stats url');
  }

  return statsUrl;
}
