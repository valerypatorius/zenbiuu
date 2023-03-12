/**
 * Available player layouts
 */
export enum PlayerLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * Player DOM-elements which properties can be modified
 */
export interface PlayerElements {
  player: HTMLElement;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

/**
 * Twitch response for playlist access token request
 */
export interface AccessTokenResponse {
  data: {
    streamPlaybackAccessToken: {
      signature: string;
      value: string;
    };
  };
  extensions: {
    durationMilliseconds: number;
    operationName: string;
    requestID: string;
  };
}
