export default interface OAuthInterface {
  /**
   * Authorization location query, formed from provider-related data
   */
  query: string;

  /**
   * Authorization url to redirect user to
   */
  url: string;
}
