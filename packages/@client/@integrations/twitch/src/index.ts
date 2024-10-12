import { createInterval } from '@client/interval';
import { OAuth } from '@client/oauth';
import {
  type AccountEntity,
  type ChannelEntity,
  type ChatMessage,
  type LiveStream,
  type ProviderApiInterface,
  ProviderEvent,
} from '@client/shared';
import { AbstractPlatformProvider } from '@client/shared';
import { Sockets } from '@client/sockets';
import { Transport } from '@client/transport';
import {
  Minute,
  deleteObjectProperty,
  getExpirationDateFromNow,
  uid,
  unixtime,
} from '@zenbiuu/shared';
import config from './config';
import { composeStreamPlaylistUrl } from './methods/composeStreamPlaylistUrl';
import { composeWatchStatsData } from './methods/composeWatchStatsData';
import { getChannelSettingsScriptUrl } from './methods/getChannelSettingsScriptUrl';
import { getChannelWatchStatsUrl } from './methods/getChannelWatchStatsUrl';
import { getChatMessageEmotes } from './methods/getChatMessageEmotes';
import { getStreamPlaylistAccessTokenQuery } from './methods/getStreamPlaylistAccessTokenQuery';
import { parseChatMessage } from './methods/parseChatMessage';
import type {
  TwitchFollowedChannel,
  TwitchPlaylistAccessTokenResponse,
  TwitchResponse,
  TwitchStream,
  TwitchUser,
  TwitchValidTokenProperties,
} from './types';

export default class Twitch
  extends AbstractPlatformProvider
  implements ProviderApiInterface
{
  public static readonly config = config;

  public readonly name = Twitch.config.name;

  protected readonly clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;

  protected readonly deviceId = uid();

  protected username?: string;

  protected userId?: string;

  readonly #chatMessageHandlers = new Map<
    string,
    (message: ChatMessage) => void
  >();

  readonly #streamViewIntervals = new Map<string, () => void>();

  readonly #settingsUrlsByChannelName = new Map<string, string>();

  #isTokenValidated = false;

  protected readonly oauth = new OAuth({
    name: Twitch.config.name,
    path: Twitch.config.oauthPath,
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

      const message = parseChatMessage(data);
      const messageChannel = message?.channel?.toLowerCase();

      if (
        message === undefined ||
        message.command !== 'PRIVMSG' ||
        messageChannel === undefined
      ) {
        return;
      }

      const handler = this.#chatMessageHandlers.get(messageChannel);
      const text = message.text;
      const author = message.tags?.['display-name'];

      if (
        handler !== undefined &&
        text !== undefined &&
        message.tags?.id !== undefined &&
        author !== undefined
      ) {
        const emotes = getChatMessageEmotes(message);

        handler({
          text,
          emotes,
          id: message.tags.id,
          author,
          color: message.tags.color,
          isModerator: message.tags.mod === '1',
          isSubscriber: message.tags.subscriber === '1',
          isStreamer: messageChannel === author.toLowerCase(),
        });
      }
    },
  });

  async #callTwitchApi<T>(
    path: `/${string}`,
  ): Promise<TwitchResponse<T>['data']> {
    const endpoint = `https://api.twitch.tv/helix${path}`;
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

  public connect(account: Pick<AccountEntity, 'id' | 'name' | 'token'>): void {
    /**
     * When connecting provider to token, reset its validation state
     */
    if (this.accessToken !== undefined) {
      this.#isTokenValidated = false;
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
    if (!this.#isTokenValidated) {
      void this.#validate(this.accessToken);
    }
  }

  public disconnect(): void {
    this.accessToken = undefined;
    this.username = undefined;
    this.userId = undefined;
    this.#isTokenValidated = false;

    deleteObjectProperty(this.transportHeaders, 'Authorization');
    deleteObjectProperty(this.transportHeaders, 'Client-Id');
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
   */
  async #validate(
    token: string,
  ): Promise<{ username: string; expiresIn: string; userId: string }> {
    const {
      expires_in: expiresIn,
      login: username,
      user_id: userId,
    } = await this.catchable<TwitchValidTokenProperties>(
      'get',
      'https://id.twitch.tv/oauth2/validate',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    this.#isTokenValidated = true;

    return {
      username,
      userId,
      expiresIn: getExpirationDateFromNow(expiresIn),
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async login(): Promise<AccountEntity> {
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
    const { expiresIn, username, userId } = await this.#validate(token);

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
    const data = await this.#callTwitchApi<TwitchUser>('/users');
    const user = data[0];

    return {
      id: user.id,
      name: user.display_name,
      avatar: user.profile_image_url,
      token,
      provider: Twitch.config.name,
      tokenExpirationDate: expiresIn,
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/revoke-tokens/
   */
  public async logout(token: string): Promise<void> {
    this.disconnect();

    await this.catchable<never>(
      'post',
      `https://id.twitch.tv/oauth2/revoke?client_id=${this.clientId}&token=${token}`,
    );
  }

  public joinChat(
    channel: string,
    onMessage: (message: ChatMessage) => void,
  ): void {
    this.#chatMessageHandlers.set(channel.toLowerCase(), onMessage);

    this.chat.send(`JOIN #${channel}`);
  }

  public leaveChat(channel: string): void {
    this.chat.send(`PART #${channel}`);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-channels
   */
  public async getFollowedChannelsNamesByUserId(id: string): Promise<string[]> {
    const data = await this.#callTwitchApi<TwitchFollowedChannel>(
      `/channels/followed?user_id=${id}&first=100`,
    );

    return data.map((item) => item.broadcaster_name);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-streams
   */
  public async getFollowedStreamsByUserId(id: string): Promise<LiveStream[]> {
    const data = await this.#callTwitchApi<TwitchStream>(
      `/streams/followed?user_id=${id}&first=100`,
    );

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
  public async getChannelsByNames(names: string[]): Promise<ChannelEntity[]> {
    if (names.length === 0) {
      throw new Error('Users names are not provided');
    }

    const searchQuery = `login=${names.map((name) => name.toLowerCase()).join('&login=')}`;

    /**
     * @todo Deal with exceeding 100 items limit
     */
    const data = await this.#callTwitchApi<TwitchUser>(`/users?${searchQuery}`);

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

  private async getChannelWatchStatsUrl(name: string): Promise<string> {
    const cached = this.#settingsUrlsByChannelName.get(name);

    if (cached !== undefined) {
      return cached;
    }

    const url = `https://www.twitch.tv/${name}`;
    const page = await this.transport.get<string>(
      url,
      { headers: undefined },
      'text',
    );
    const channelSettingsScriptUrl = getChannelSettingsScriptUrl(page);
    const settingsContent = await this.transport.get<string>(
      channelSettingsScriptUrl,
      { headers: undefined },
      'text',
    );
    const statsUrl = getChannelWatchStatsUrl(settingsContent);

    this.#settingsUrlsByChannelName.set(name, statsUrl);

    return statsUrl;
  }

  private async sendStreamWatchStats(
    stream: LiveStream,
    url: string,
  ): Promise<void> {
    const data = composeWatchStatsData(this.userId ?? '0', stream);

    await this.transport.post(url, {
      body: `data=${data}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
    });
  }

  public async playStream(
    name: string,
    stream?: LiveStream,
  ): Promise<string | undefined> {
    const accessToken = await this.catchable<TwitchPlaylistAccessTokenResponse>(
      'post',
      'https://gql.twitch.tv/gql',
      {
        body: getStreamPlaylistAccessTokenQuery(name),
        headers: {
          'Client-ID': import.meta.env.VITE_TWITCH_STREAM_CLIENT_ID,
          'Device-ID': this.deviceId,
        },
      },
    );

    if (stream !== undefined) {
      void this.getChannelWatchStatsUrl(name).then((url) => {
        const stopStreamViewInterval = createInterval(() => {
          void this.sendStreamWatchStats(stream, url);
        }, Minute);

        this.#streamViewIntervals.set(name, stopStreamViewInterval);
      });
    }

    return composeStreamPlaylistUrl(name, accessToken);
  }

  public stopStream(name: string): void {
    this.#streamViewIntervals.get(name)?.();
    this.#streamViewIntervals.delete(name);
  }

  public requestEmotesForChannelId(id: string): void {
    const emoteProviders = ['7tv', 'ffz', 'bttv'];

    for (const emoteProvider of emoteProviders) {
      /**
       * @todo Perform request again when status is 200, but nothing has been returned
       */
      this.emotesProviders
        .getApi(emoteProvider)
        .getChannelEmotes(id)
        .then((emotes) => {
          const event = new CustomEvent(ProviderEvent.EmotesReceived, {
            detail: {
              id,
              emotes,
            },
          });

          window.dispatchEvent(event);
        })
        .catch((error) => {
          /**
           * @todo Handle 404
           */
          console.error(error);
        });
    }
  }
}
