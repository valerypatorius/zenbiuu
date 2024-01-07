interface SevenTvEmote {
  id: string;
  name: string;
  timestamp: number;
  data: {
    id: string;
    name: string;
    animated: boolean;
    host: {
      url: string;
      files: Array<{
        format: 'WEBP' | 'AVIF';
        width: number;
        height: number;
        size: number;
        name: `${1 | 2 | 3 | 4}x.${'webp' | 'avif'}`;
        static_name: `${1 | 2 | 3 | 4}x_static.${'webp' | 'avif'}`;
        framt_count: number;
      }>;
    };
  };
}

export interface SevenTvChannelEmotesResponse {
  id: string;
  username: string;
  display_name: string;
  emote_set: {
    name: string;
    emotes: SevenTvEmote[];
  };
}
