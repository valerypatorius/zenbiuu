interface FFZEmote {
  width: number;
  height: number;
  name: string;
  urls: {
    1: string;
    2: string;
    4: string;
  };
}

export interface FFZChannelEmotesResponse {
  sets: Record<number, {
    id: number;
    title: string;
    emoticons: FFZEmote[];
  }>;
}
