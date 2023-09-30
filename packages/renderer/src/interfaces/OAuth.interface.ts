export default interface OAuthInterface {
  /**
   * App client id, used for authorization
   */
  clientId: string;

  /**
   * Authorization location query, formed from provider-related data
   */
  query: string;

  /**
   * Authorization url to redirect user to
   */
  url: string;
}
