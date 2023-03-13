import { reactive } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useUser } from '@/src/modules/auth/useUser';

enum StatsError {
  MissingChannelSettings = 'Missing channel settings file',
  MissingPostUrl = 'Missing URL for stats posting',
}

interface StatsPayload {
  channelName: string;
  channelId: string;
  broadcastId: string;
}

const CHANNEL_PAGE_DOMAIN = 'https://www.twitch.tv';

export const useStats = createSharedComposable(() => {
  const { get, post } = useRequest();
  const { state: userState } = useUser();

  const urls = reactive(new Map<string, string>());

  /**
   * Returns url for stats posting
   */
  async function getStatsPostUrlByChannel (channelName: string): Promise<string> {
    const cachedUrl = urls.get(channelName);

    /**
     * If cached url exist, return it
     */
    if (cachedUrl !== undefined) {
      return cachedUrl;
    }

    const channelPageUrl = `${CHANNEL_PAGE_DOMAIN}/${channelName}`;

    /**
     * Get channel page as plain text
     */
    const channelPage = await get<string>(channelPageUrl, {
      headers: undefined,
    }, 'text');

    /**
     * Find link to channel settings file
     */
    const channelSettingsUrl = channelPage.match(/https:\/\/static.twitchcdn.net\/config\/settings.*?js/)?.[0];

    if (channelSettingsUrl === undefined) {
      return await Promise.reject(StatsError.MissingChannelSettings);
    }

    /**
     * Get channel settings file as plain text
     */
    const settingsContent = await get<string>(channelSettingsUrl, {
      headers: undefined,
    }, 'text');

    /**
     * Search for stats url in received file
     */
    const statsUrl = settingsContent.match(/"spade_url":"(.*?)"/)?.[1];

    if (statsUrl === undefined) {
      return await Promise.reject(StatsError.MissingPostUrl);
    }

    /**
     * Save stats url in cache
     */
    urls.set(channelName, statsUrl);

    return statsUrl;
  }

  /**
   * Wrapper function to call url caching
   */
  async function prepareUrlForChannel (channelName: string): Promise<void> {
    await getStatsPostUrlByChannel(channelName);
  }

  /**
   * Form stats object and send it
   */
  async function send ({ broadcastId, channelName, channelId }: StatsPayload): Promise<void> {
    const data = [
      {
        event: 'minute-watched',
        properties: {
          broadcast_id: broadcastId,
          channel_id: channelId,
          user_id: parseInt(userState.id ?? '0', 10),
          player: 'site',
        },
      },
    ];

    /**
     * Data should be encoded and sent as encoded url.
     * JSON will not work
     */
    try {
      const url = await getStatsPostUrlByChannel(channelName);
      const dataEncoded = btoa(JSON.stringify(data));

      await post(url, `data=${dataEncoded}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return {
    prepareUrlForChannel,
    send,
  };
});
