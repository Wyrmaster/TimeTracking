/**
 * Credentials of a user used when the authentication was successful
 */
export interface IToken {
  user: string;
  bearerToken: string;
}