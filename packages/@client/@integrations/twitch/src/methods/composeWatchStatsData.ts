import type { LiveStream } from '@client/shared';

export function composeWatchStatsData(
  userId: string,
  stream: LiveStream,
): string {
  const data = [
    {
      event: 'minute-watched',
      properties: {
        broadcast_id: stream.id,
        channel_id: stream.channelId,
        user_id: Number.parseInt(userId, 10),
        player: 'site',
      },
    },
  ];

  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    throw new Error('Failed to compose watch stats data');
  }
}
