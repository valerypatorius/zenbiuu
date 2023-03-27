import type { ChatEmote, TwitchEmotesResponse, TwitchEmoteData, BttvEmoteDataDefault, BttvEmoteDataShared, FfzEmoteData, SevenTvEmoteData } from '../types/chat';

function formTwitchEmoteUrl (data: TwitchEmoteData, scale: TwitchEmoteData['scale'][number], template: string): string {
  const format = data.format.find((value) => value === 'animated') ?? 'static';

  return template
    .replace('{{id}}', data.id)
    .replace('{{format}}', format)
    .replace('{{theme_mode}}', 'light')
    .replace('{{scale}}', scale);
};

export function parseTwitchEmotes (source: TwitchEmotesResponse): Record<string, ChatEmote> {
  return source.data.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      urls: emote.scale.reduce<ChatEmote['urls']>((result, size) => {
        result[`${size}x`] = formTwitchEmoteUrl(emote, size, source.template);
        return result;
      }, {}),
    };

    return result;
  }, {});
}

export function parseBTTVEmotes (source: Array<BttvEmoteDataDefault | BttvEmoteDataShared>): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.code] = {
      urls: [1, 2, 3].reduce<ChatEmote['urls']>((result, size) => {
        result[`${size}x`] = `https://cdn.betterttv.net/emote/${emote.id}/${size}x`;
        return result;
      }, {}),
    };

    return result;
  }, {});
}

export function parseFFZEmotes (source: FfzEmoteData[]): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      urls: Object.entries(emote.urls).reduce<ChatEmote['urls']>((result, [size, url]) => {
        result[`${size}x`] = url;
        return result;
      }, {}),
    };

    return result;
  }, {});
}

export function parse7TVEmotes (source: SevenTvEmoteData[]): Record<string, ChatEmote> {
  return source.reduce<Record<string, ChatEmote>>((result, emote) => {
    result[emote.name] = {
      urls: emote.urls.reduce<ChatEmote['urls']>((result, [size, url]) => {
        result[`${size}x`] = url;
        return result;
      }, {}),
    };

    return result;
  }, {});
}
