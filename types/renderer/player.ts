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
  expires_at: string;
  mobile_restricted: boolean;
  sig: string;
  token: string;
}
