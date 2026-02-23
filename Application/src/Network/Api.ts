import {Intent} from './Intent.ts';
import {BodyIntent} from './BodyIntent.ts';
import {IResponse} from './IResponse.ts';
import {settings} from '../Common/Settings.ts';

/**
 * class used to comunicate with an endpoint
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
    this._token = settings.GetToken();
  }

  // endregion

  // region Methods

  /**
   * Sends a Http Request to the endpoint
   * @param intent describing an a route and its parameter
   * @constructor
   */
  public SendAsync = async <T>(intent: Intent<T>): Promise<IResponse<T>> => {
    let responseDto: IResponse<T> = {code: 0, response: null};

    try {
      const response: Response = await fetch(`${this._endPoint}${intent.GetRoute()}`, {
        method: intent.GetMethod(),
        headers: this._token == null
          ? {
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this._token}`,
            },
        body: (intent as unknown as BodyIntent<never, T>)?.GetBody == undefined
          ? null
          : JSON.stringify((intent as unknown as BodyIntent<never, T>).GetBody()),
      });
      if (response.status == 401) {
        this._unauthorizedCallback();
        responseDto.code = 401;
        return responseDto;
      }
      if (response.status == 402) {
        this._unauthorizedCallback();
        responseDto.code = 402;
        return responseDto;
      }
      responseDto.response = response.status == 200 ? (await response.json()) as T : null;
      responseDto.code = response.status;
    }
    catch(err) {
      console.error(err);
      responseDto.code = 500
    }

    if (intent.GetCallback() != null)
    {
      (intent.GetCallback() as ((response: IResponse<T>) => void|Promise<void>))(responseDto);
    }

    return responseDto;
  };

  public SetToken = (token: string) => {
    this._token = token;
  }

  // endregion
}

const apiFactory = (unauthorizedCallback: () => void): Api => new Api(unauthorizedCallback);

export {
  apiFactory,
  type Api
}
