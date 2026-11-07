import {Intent} from './intent.ts';
import {BodyIntent} from './bodyIntent.ts';
import type {IResponse} from './response.ts';
import {ApiError} from './apiError.ts';
import {settings} from '../common/settings.ts';

/**
 * Timestamps sent by the api, converted into dates while parsing a response
 */
const ISO_TIMESTAMP: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Converts the timestamps of a parsed response into dates, so the dtos can declare them as `Date`.
 * @param _ key of the parsed value
 * @param value the parsed value
 */
const reviveDates = (_: string, value: unknown): unknown =>
  typeof value == 'string' && ISO_TIMESTAMP.test(value) ? new Date(value) : value;

/**
 * Whether an intent sends a body
 * @param intent the intent to check
 */
const hasBody = <T, >(intent: Intent<T>): intent is BodyIntent<T, unknown> =>
  intent instanceof BodyIntent;

/**
 * class used to communicate with an endpoint
 */
class Api {

  // region Fields

  private readonly _endPoint: string;
  private readonly _unauthorizedCallback: () => void;
  private _token: string|null = null;

  // endregion

  // region Constructor

  constructor(unauthorizedCallback: () => void) {
    this._unauthorizedCallback = unauthorizedCallback;
    this._endPoint = window.location.origin.replace(/\/*$/, '');
    this._token = settings.getToken();
  }

  // endregion

  // region Methods

  /**
   * Sends a Http Request to the endpoint, failures are reported by the status code of the response
   * @param intent describing a route and its parameter
   */
  public sendAsync = async <T, >(intent: Intent<T>): Promise<IResponse<T>> => {
    try {
      const response: Response = await this.fetchAsync(intent, {
        'Content-Type': 'application/json',
      });

      return {
        code: response.status,
        response: await this.readBodyAsync<T>(response),
        etag: response.headers.get('ETag'),
      };
    }
    catch (error) {
      console.error(error);
      return {code: 0, response: null};
    }
  };

  /**
   * Sends a Http Request to the endpoint and returns the body of a successful response
   * @param intent describing a route and its parameter
   * @throws ApiError when the request fails or is answered with an error status
   */
  public requestAsync = async <T, >(intent: Intent<T>): Promise<T> => {
    const response: IResponse<T> = await this.sendAsync(intent);

    if (response.code < 200 || response.code >= 300) {
      throw new ApiError(response.code, intent.getRoute());
    }

    return response.response as T;
  };

  /**
   * Sends a Http Request to the endpoint and returns the body of the response as file
   * @param intent describing a route and its parameter
   * @throws ApiError when the request fails or is answered with an error status
   */
  public downloadAsync = async (intent: Intent<Blob>): Promise<Blob> => {
    const response: Response = await this.fetchAsync(intent, {});

    if (!response.ok) {
      throw new ApiError(response.status, intent.getRoute());
    }

    return await response.blob();
  };

  /**
   * Sets the token used to authenticate the requests, an empty token signs the user out
   * @param token the bearer token
   */
  public setToken = (token: string) => {
    this._token = token == '' ? null : token;
    settings.setToken(token);
  };

  // endregion

  // region Private Methods

  /**
   * Sends the request described by an intent, unauthorized responses sign the user out
   * @param intent describing a route and its parameter
   * @param headers headers sent in addition to the authorization and the headers of the intent
   */
  private fetchAsync = async <T, >(intent: Intent<T>, headers: Record<string, string>): Promise<Response> => {
    const response: Response = await fetch(`${this._endPoint}${intent.getRoute()}`, {
      method: intent.getMethod(),
      // conditional requests are handled by the intents themselves, the browser cache must not answer them
      cache: 'no-store',
      headers: {
        ...headers,
        ...(this._token == null ? {} : {'Authorization': `Bearer ${this._token}`}),
        ...intent.getHeaders(),
      },
      body: hasBody(intent) ? JSON.stringify(intent.getBody()) : null,
    });

    if (response.status == 401 || response.status == 402) {
      this._unauthorizedCallback();
    }

    return response;
  };

  /**
   * Reads and deserializes the body of a response, if it has one
   * @param response the response returned by fetch
   */
  private readBodyAsync = async <T, >(response: Response): Promise<T|null> => {
    // 204 No Content, 205 Reset Content and 304 Not Modified never carry a body
    if (response.status == 204 || response.status == 205 || response.status == 304) {
      return null;
    }

    const text: string = await response.text();

    return text.length == 0 ? null : JSON.parse(text, reviveDates) as T;
  };

  // endregion
}

const apiFactory = (unauthorizedCallback: () => void): Api => new Api(unauthorizedCallback);

export {
  apiFactory,
  type Api,
};
