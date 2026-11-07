import {HttpMethod} from './httpMethod.ts';
import type {ResponseCallback} from '../types/responseCallback.ts';

/**
 * Base Intent used for communication
 */
export abstract class Intent<T> {

  // region Fields

  private readonly _route: string;
  private readonly _method: HttpMethod;
  private readonly _callback: ResponseCallback<T>;

  /**
   * additional headers sent with the http request
   */
  protected _headers: Record<string, string> = {};

  // endregion

  // region Constructor

  /**
   * setups the intent
   * @param route target of the http request
   * @param method http method used for the http request
   * @param callback response method used when the http request finished
   * @protected
   */
  protected constructor(route: string, method: HttpMethod, callback: ResponseCallback<T> = null) {
    this._route = route;
    this._method = method;
    this._callback = callback;
  }

  // endregion

  // region Methods

  /**
   * the assigned route
   */
  public GetRoute = (): string => this._route;

  /**
   * the assigned http method
   */
  public GetMethod = (): HttpMethod => this._method;

  /**
   * the callback to be executed when the response had finished
   */
  public GetCallback = (): ResponseCallback<T> => this._callback;

  /**
   * additional headers sent with the http request
   */
  public GetHeaders = (): Record<string, string> => this._headers;

  // endregion

  // region Protected Methods

  protected static CreateQuery = (items: {key: string, values: (string|null)[]}[]) =>
    `?` + items
      .map(item => item
        .values
        .filter(entry => entry != null)
        .map(entry => `${item.key}=${encodeURIComponent(entry)}`)
        .join('&'))
      .filter(part => part.length > 0)
      .join('&');

  // endregion

}