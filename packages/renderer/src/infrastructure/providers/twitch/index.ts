import AbstractProvider from '../AbstractProvider';
import config from './config';
import type { TwitchValidTokenProperties, TwitchUser, TwitchStream, TwitchFollowedChannel, TwitchResponse, TwitchPlaylistAccessTokenResponse } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import type ChatMessage from '@/entities/ChatMessage';
import Sockets from '@/sockets/Sockets';
import OAuth from '@/oauth/OAuth';
import Transport from '@/transport/Transport';
import { getExpirationDateFromNow } from '@/utils/date';
import TransportStatus from '@/entities/TransportStatus';
import ProviderEvent from '@/entities/ProviderEvent';
import { deleteObjectProperty } from '@/utils/object';
import { uid } from '@/utils/string';
import { parseMessage } from '@/utils/irc';

export default class Twitch extends AbstractProvider implements ProviderApiInterface {
  protected readonly config = config;

  protected readonly clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;

  protected readonly deviceId = uid();

  protected username: string | undefined;

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

      /**
       * @todo Move to Twitch provider dir
       */
      const message = parseMessage(data);

      if (message === undefined || message.command !== 'PRIVMSG') {
        return;
      }

      if (message.channel?.toLowerCase() !== undefined) {
        const handler = this.chatMessageHandlers.get(message.channel.toLowerCase());

        if (handler !== undefined && message.text !== undefined && message.tags !== undefined) {
          handler({
            /**
             * @todo Properly type message tags
             */
            id: message.tags.id,
            author: message.tags['display-name'],
            text: message.text,
            color: message.tags.color,
          });
        }
      }
    },
  });

  private readonly chatMessageHandlers = new Map<string, (message: ChatMessage) => void>();

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

  public connect (token: string, username: string): void {
    /**
     * When connecting provider to token, reset its validation state
     */
    if (this.accessToken !== undefined) {
      this.isTokenValidated = false;
    }

    this.accessToken = token;
    this.username = username;

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
     */
    if (!this.isTokenValidated) {
      void this.validate(this.accessToken);
    }
  }

  public disconnect (): void {
    this.accessToken = undefined;
    this.username = undefined;
    this.isTokenValidated = false;

    deleteObjectProperty(this.transportHeaders, 'Authorization');
    deleteObjectProperty(this.transportHeaders, 'Client-Id');
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
   */
  private async validate (token: string): Promise<{ username: string; expiresIn: string }> {
    const { expires_in: expiresIn, login: username } = await this.catchable<TwitchValidTokenProperties>('get', 'https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.isTokenValidated = true;

    return {
      username,
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
    const { expiresIn, username } = await this.validate(token);

    /**
     * Connect provider with new token
     */
    this.connect(token, username);

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
      title: item.title,
      cover: item.thumbnail_url.replace('{width}x{height}', '640x360'),
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

  public async getChannelPlaylistUrl (name: string): Promise<string | undefined> {
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

    return `https://usher.ttvnw.net/api/channel/hls/${name.toLowerCase()}.m3u8?${query}`;
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
