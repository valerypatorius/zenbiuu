import { EmoteProvider, type ChatEmote, type TwitchEmotesResponse, type TwitchEmoteData, type BttvEmoteDataDefault, type BttvEmoteDataShared, type FfzEmoteData, type SevenTvEmoteData } from '../types/chat';

/**
 * Returns Twitch emote url, based on provided data and template
 */
function formTwitchEmoteUrl (data: TwitchEmoteData, scale: TwitchEmoteData['scale'][number], template: string): string {
  const format = data.format.find((value) => value === 'animated') ?? 'static';

  return template
    .replace('{{id}}', data.id)
    .replace('{{format}}', format)
    .replace('{{theme_mode}}', 'light')
    .replace('{{scale}}', scale);
};

/**
 * Returns Twitch emotes dictionary, built from provided list
 */
export function parseTwitchEmotes (source: TwitchEmotesResponse): Record<string, ChatEmote> {
  return source.data.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      name: emote.name,
      provider: EmoteProvider.Twitch,
      urls: emote.scale.reduce<ChatEmote['urls']>((result, size) => {
        result[`${size}x`] = formTwitchEmoteUrl(emote, size, source.template);
        return result;
      }, {}),
    };

    return result;
  }, {});
}

/**
 * Returns BTTV emotes dictionary, built from provided list
 */
export function parseBTTVEmotes (source: Array<BttvEmoteDataDefault | BttvEmoteDataShared>): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.code] = {
      name: emote.code,
      provider: EmoteProvider.BTTV,
      urls: [1, 2, 3].reduce<ChatEmote['urls']>((result, size) => {
        result[`${size}x`] = `https://cdn.betterttv.net/emote/${emote.id}/${size}x`;
        return result;
      }, {}),
    };

    return result;
  }, {});
}

/**
 * Returns FFZ emotes dictionary, built from provided list
 */
export function parseFFZEmotes (source: FfzEmoteData[]): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      name: emote.name,
      provider: EmoteProvider.FFZ,
      urls: Object.entries(emote.urls).reduce<ChatEmote['urls']>((result, [size, url]) => {
        result[`${size}x`] = url;
        return result;
      }, {}),
    };

    return result;
  }, {});
}

/**
 * Returns 7TV emotes dictionary, built from provided list
 */
export function parse7TVEmotes (source: SevenTvEmoteData[]): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      name: emote.name,
      provider: EmoteProvider.SevenTV,
      urls: emote.urls.reduce<ChatEmote['urls']>((result, [size, url]) => {
        result[`${size}x`] = url;
        return result;
      }, {}),
    };

    return result;
  }, {});
}

/**
 * Returns emote urls string to use as srcset value
 */
export function getEmoteSrcSet (urls: Record<`${string}x` | `${number}x`, string>): string {
  return Object.entries(urls).reduce<string[]>((result, [size, url]) => {
    result.push(`${url} ${size}`);
    return result;
  }, []).join(',');
}

/**
 * Returns HTML of an emote, ready for display
 */
export function getEmoteHtml (name: string, urls: Record<`${string}x` | `${number}x`, string>): string {
  return `<span class="emote" title="${name}">
      <img alt="${name}" srcset="${getEmoteSrcSet(urls)}" loading="lazy">
    </span>`;
}
