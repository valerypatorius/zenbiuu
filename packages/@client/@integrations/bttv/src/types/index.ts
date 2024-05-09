interface BTTVEmote {
  aniamted: boolean;
  code: string;
  id: string;
  imageType: 'png' | 'gif';
}

export interface BTTVChannelEmotesResponse {
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
}
