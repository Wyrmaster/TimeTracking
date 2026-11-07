import {HttpMethod} from './httpMethod.ts';

/**
 * Parameter of a query string, parameters with multiple values are repeated
 */
export interface IQueryParameter {
  key: string;
  values: (string|null)[];
}

/**
 * Describes a single request to the api: its route, http method and the type of its response.
 */
export abstract class Intent<T> {

  // region Fields

  private readonly _route: string;
  private readonly _method: HttpMethod;

  /**
   * additional headers sent with the http request
   */
  protected _headers: Record<string, string> = {};

  /**
   * only used to carry the type of the response, never assigned
   */
  declare readonly responseType?: T;

  // endregion

  // region Constructor

  /**
   * setups the intent
   * @param route target of the http request
   * @param method http method used for the http request
   * @protected
   */
  protected constructor(route: string, method: HttpMethod) {
    this._route = route;
    this._method = method;
  }

  // endregion

  // region Methods

  /**
   * the assigned route
   */
  public getRoute = (): string => this._route;

  /**
   * the assigned http method
   */
  public getMethod = (): HttpMethod => this._method;

  /**
   * additional headers sent with the http request
   */
  public getHeaders = (): Record<string, string> => this._headers;

  // endregion

  // region Protected Methods

  /**
   * Creates a query string, parameters without a value are left out.
   * @param parameters the parameters of the query string
   */
  protected static createQuery = (parameters: IQueryParameter[]): string => {
    const query: string = parameters
      .flatMap(parameter => parameter.values
        .filter((value): value is string => value != null)
        .map(value => `${parameter.key}=${encodeURIComponent(value)}`))
      .join('&');

    return query.length == 0 ? '' : `?${query}`;
  };

  // endregion

}
