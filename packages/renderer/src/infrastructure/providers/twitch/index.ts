import AbstractProvider from '../AbstractProvider';
import config from './config';
import { parseMessage } from './utils';
import type { TwitchValidTokenProperties, TwitchUser, TwitchStream, TwitchFollowedChannel, TwitchResponse, TwitchPlaylistAccessTokenResponse } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import type ChatMessage from '@/entities/ChatMessage';
import Sockets from '@/sockets/Sockets';
import OAuth from '@/oauth/OAuth';
import Transport from '@/transport/Transport';
import date, { getExpirationDateFromNow, unixtime } from '@/utils/date';
import TransportStatus from '@/entities/TransportStatus';
import ProviderEvent from '@/entities/ProviderEvent';
import { deleteObjectProperty } from '@/utils/object';
import { uid } from '@/utils/string';
import { createInterval } from '@/interval/index';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export default class Twitch extends AbstractProvider implements ProviderApiInterface {
  protected readonly config = config;

  protected readonly clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;

  protected readonly deviceId = uid();

  protected username?: string;

  protected userId?: string;

  protected readonly oauth = new OAuth({
    name: this.config.name,
    path: this.config.oauthPath,
    clientId: this.clientId,
    scopes: [
      'chat:read',
      'chat:edit',
      'channel:moderate',
      'user:read:follows',
      'channel:read:subscriptions',
    ],
  });

  protected readonly transport = new Transport(this.transportHeaders);

  protected readonly chat = new Sockets('wss://irc-ws.chat.twitch.tv:443', {
    onMessage: ({ data }) => {
      if (data.startsWith('PING') === true) {
        this.chat.send(data.replace('PING', 'PONG'));

        return;
      }

      const message = parseMessage(data);

      if (message === undefined || message.command !== 'PRIVMSG') {
        return;
      }

      if (message.channel?.toLowerCase() !== undefined) {
        const handler = this.chatMessageHandlers.get(message.channel.toLowerCase());
        const text = message.text;

        if (handler !== undefined && text !== undefined && message.tags?.id !== undefined && message.tags['display-name'] !== undefined) {
          const emotes = message.tags.emotes !== undefined
            ? Object.entries(message.tags.emotes).reduce<Record<string, EmoteEntity>>((result, [id, position]) => {
              const name = text.substring(position[0].start, position[0].end + 1);

              result[name] = {
                '1.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`,
                '2.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
                '3.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`,
              };

              return result;
            }, {})
            : {};

          handler({
            text,
            emotes,
            id: message.tags.id,
            author: message.tags['display-name'],
            color: message.tags.color,
            isModerator: message.tags.mod === '1',
            isSubscriber: message.tags.subscriber === '1',
          });
        }
      }
    },
  });

  private readonly chatMessageHandlers = new Map<string, (message: ChatMessage) => void>();

  private readonly streamViewIntervals = new Map<string, () => void>();

  private readonly settingsUrlsByChannelName = new Map<string, string>();

  private isTokenValidated = false;

  /**
   * @todo If token is not validated at this moment, wait for it
   */
  private async catchable <T>(method: 'get' | 'post', url: string, options?: RequestInit, parser?: 'text'): Promise<T> {
    return await new Promise((resolve, reject) => {
      this.transport[method]<T>(url, options, parser).then((result) => {
        resolve(result);
      }).catch((error) => {
        if (!(error instanceof Error) || error.cause === undefined) {
          reject(error);

          return;
        }

        if (error.cause === TransportStatus.NotAuthorized) {
          const event = new CustomEvent(ProviderEvent.Disconnect, {
            detail: {
              api: this,
              provider: this.config.name,
              token: this.accessToken,
            },
          });

          window.dispatchEvent(event);
        }
      });
    });
  }

  private async callTwitchApi<T> (endpoint: string): Promise<TwitchResponse<T>['data']> {
    const chunk = await this.catchable<TwitchResponse<T>>('get', endpoint);
    const result = chunk.data;

    let cursor = chunk.pagination?.cursor;

    /**
     * If pagination cursor is present, call API again and again until all data is received
     */
    while (cursor !== undefined) {
      const url = new URL(endpoint);

      url.searchParams.append('after', cursor);

      const chunk = await this.catchable<TwitchResponse<T>>('get', url.href);

      result.push(...chunk.data);

      cursor = chunk.pagination?.cursor;
    }

    return result;
  }

  public connect (account: Pick<AccountEntity, 'id' | 'name' | 'token'>): void {
    /**
     * When connecting provider to token, reset its validation state
     */
    if (this.accessToken !== undefined) {
      this.isTokenValidated = false;
    }

    this.accessToken = account.token;
    this.username = account.name;
    this.userId = account.id;

    this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;
    this.transportHeaders['Client-Id'] = this.clientId;

    /**
     * @todo Deal with reconnecting when switching accounts
     */
    this.chat.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    this.chat.send(`PASS oauth:${this.accessToken}`);
    this.chat.send(`NICK ${this.username}`);

    /**
     * If token is not validated, call validation, but do not wait for it
     * @todo Call every hour or so
     */
    if (!this.isTokenValidated) {
      void this.validate(this.accessToken);
    }
  }

  public disconnect (): void {
    this.accessToken = undefined;
    this.username = undefined;
    this.userId = undefined;
    this.isTokenValidated = false;

    deleteObjectProperty(this.transportHeaders, 'Authorization');
    deleteObjectProperty(this.transportHeaders, 'Client-Id');
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
   */
  private async validate (token: string): Promise<{ username: string; expiresIn: string; userId: string }> {
    const { expires_in: expiresIn, login: username, user_id: userId } = await this.catchable<TwitchValidTokenProperties>('get', 'https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.isTokenValidated = true;

    return {
      username,
      userId,
      expiresIn: getExpirationDateFromNow(expiresIn),
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async login (): Promise<AccountEntity> {
    /**
     * Receive access token
     */
    const { token } = await super.requestAuthorization();

    /**
     * Disconnect provider from previous token
     */
    this.disconnect();

    /**
     * Validate received token and receive token expiration date
     */
    const { expiresIn, username, userId } = await this.validate(token);

    /**
     * Connect provider with new token
     */
    this.connect({
      token,
      name: username,
      id: userId,
    });

    /**
     * Receive user data
     */
    const data = await this.callTwitchApi<TwitchUser>('https://api.twitch.tv/helix/users');
    const user = data[0];

    return {
      id: user.id,
      name: user.display_name,
      avatar: user.profile_image_url,
      token,
      provider: this.config.name,
      tokenExpirationDate: expiresIn,
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/revoke-tokens/
   */
  public async logout (token: string): Promise<void> {
    this.disconnect();

    await this.catchable<never>('post', `https://id.twitch.tv/oauth2/revoke?client_id=${this.clientId}&token=${token}`);
  }

  public joinChat (channel: string, onMessage: (message: ChatMessage) => void): void {
    this.chatMessageHandlers.set(channel.toLowerCase(), onMessage);

    this.chat.send(`JOIN #${channel}`);
  }

  public leaveChat (channel: string): void {
    this.chat.send(`PART #${channel}`);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-channels
   */
  public async getFollowedChannelsNamesByUserId (id: string): Promise<string[]> {
    const data = await this.callTwitchApi<TwitchFollowedChannel>(`https://api.twitch.tv/helix/channels/followed?user_id=${id}&first=100`);

    return data.map((item) => item.broadcaster_name);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-streams
   */
  public async getFollowedStreamsByUserId (id: string): Promise<LiveStream[]> {
    const data = await this.callTwitchApi<TwitchStream>(`https://api.twitch.tv/helix/streams/followed?user_id=${id}&first=100`);

    return data.map((item) => ({
      id: item.id,
      channelId: item.user_id,
      title: item.title,
      cover: `${item.thumbnail_url.replace('{width}x{height}', '640x360')}?t=${unixtime()}`,
      category: item.game_name,
      channelName: item.user_name,
      viewersCount: item.viewer_count,
      dateStarted: item.started_at,
    }));
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async getChannelsByNames (names: string[]): Promise<ChannelEntity[]> {
    if (names.length === 0) {
      throw new Error('Users names are not provided');
    }

    const searchQuery = `login=${names.map((name) => name.toLowerCase()).join('&login=')}`;

    /**
     * @todo Deal with exceeding 100 items limit
     */
    const data = await this.callTwitchApi<TwitchUser>(`https://api.twitch.tv/helix/users?${searchQuery}`);

    /**
     * @todo Deal with banned channels
     */
    return data.map((item) => ({
      id: item.id,
      name: item.display_name,
      avatar: item.profile_image_url,
      offlineCover: item.offline_image_url,
      description: item.description,
    }));
  }

  private async getChannelSettingsUrl (name: string): Promise<string> {
    const cached = this.settingsUrlsByChannelName.get(name);

    if (cached !== undefined) {
      return cached;
    }

    const url = `https://www.twitch.tv/${name}`;

    const page = await this.transport.get<string>(url, { headers: undefined }, 'text');

    const channelSettingsUrl = page.match(/https:\/\/static.twitchcdn.net\/config\/settings.*?js/)?.[0];

    if (channelSettingsUrl === undefined) {
      throw new Error('Failed to locate channel settings');
    }

    const settingsContent = await this.transport.get<string>(channelSettingsUrl, { headers: undefined }, 'text');

    const statsUrl = settingsContent.match(/"spade_url":"(.*?)"/)?.[1];

    if (statsUrl === undefined) {
      throw new Error('Failed to locate channel stats url');
    }

    this.settingsUrlsByChannelName.set(name, statsUrl);

    return statsUrl;
  }

  private async sendStreamWatchStats (stream: LiveStream, url: string): Promise<void> {
    const data = [
      {
        event: 'minute-watched',
        properties: {
          broadcast_id: stream.id,
          channel_id: stream.channelId,
          user_id: parseInt(this.userId ?? '0', 10),
          player: 'site',
        },
      },
    ];

    try {
      const dataEncoded = btoa(JSON.stringify(data));

      await this.transport.post(url, {
        body: `data=${dataEncoded}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      });

      console.log(`Sent watch stats for ${stream.channelName}`, data);
    } catch (error) {
      console.error(error);
    }
  }

  public async playStream (name: string, stream?: LiveStream): Promise<string | undefined> {
    const { data } = await this.catchable<TwitchPlaylistAccessTokenResponse>('post', 'https://gql.twitch.tv/gql', {
      body: JSON.stringify({
        operationName: 'PlaybackAccessToken_Template',
        query: 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
        variables: {
          isLive: true,
          login: name,
          isVod: false,
          vodID: '',
          playerType: 'site',
        },
      }),
      headers: {
        'Client-ID': import.meta.env.VITE_TWITCH_STREAM_CLIENT_ID,
        'Device-ID': this.deviceId,
      },
    });

    const params = {
      sig: data.streamPlaybackAccessToken.signature,
      type: 'any',
      p: Math.floor(Math.random() * 999999),
      token: encodeURIComponent(data.streamPlaybackAccessToken.value),
      player: 'twitchweb',
      allow_source: true,
      allow_audio_only: true,
      allow_spectre: false,
      fast_bread: true,
      playlist_include_framerate: true,
      reassignments_supported: true,
    };

    const query = Object.entries(params).map((param) => param.join('=')).join('&');

    if (stream !== undefined) {
      void this.getChannelSettingsUrl(name).then((url) => {
        const stopStreamViewInterval = createInterval(() => {
          void this.sendStreamWatchStats(stream, url);
        }, date.Minute);

        this.streamViewIntervals.set(name, stopStreamViewInterval);
      });
    }

    return `https://usher.ttvnw.net/api/channel/hls/${name.toLowerCase()}.m3u8?${query}`;
  }

  public async stopStream (name: string): Promise<void> {
    this.streamViewIntervals.get(name)?.();
    this.streamViewIntervals.delete(name);
  }

  public requestEmotesForChannelId (id: string): void {
    /**
     * 1. 3rd party emotes
     * 2. Twitch emotes in "emotes=305502502:0-6" format
     * @see https://dev.twitch.tv/docs/irc/emotes/#cdn-template
     * @see https://static-cdn.jtvnw.net/emoticons/v2/305502502/default/dark/3.0
     */

    /**
     * @todo Improve and handle 404
     */

    /**
     * @todo Perform request again when status is 200, but nothing has been returned
     */

    this.emotesProviders.getApi('7tv').getChannelEmotes(id).then((emotes) => {
      const event = new CustomEvent(ProviderEvent.EmotesReceived, {
        detail: {
          id,
          emotes,
        },
      });

      window.dispatchEvent(event);
    });

    this.emotesProviders.getApi('ffz').getChannelEmotes(id).then((emotes) => {
      const event = new CustomEvent(ProviderEvent.EmotesReceived, {
        detail: {
          id,
          emotes,
        },
      });

      window.dispatchEvent(event);
    });

    this.emotesProviders.getApi('bttv').getChannelEmotes(id).then((emotes) => {
      const event = new CustomEvent(ProviderEvent.EmotesReceived, {
        detail: {
          id,
          emotes,
        },
      });

      window.dispatchEvent(event);
    });
  }
}
