import {Intent} from '../../intent.ts';
import {HttpMethod} from '../../httpMethod.ts';
import type {ITrackingStateDto} from './trackingStateDto.ts';

/**
 * Intent requesting the fingerprint of the tracking state, used to cheaply detect changes made
 * by other clients.
 *
 * When the etag of a previous response is given, the server answers with an empty 304 as long
 * as the tracking state did not change.
 */
export class GetTrackingStateIntent extends Intent<ITrackingStateDto> {

  // region Constructor

  constructor(etag: string|null = null) {
    super('/api/v1/timetracking/state/', HttpMethod.GET);

    if (etag != null) {
      this._headers = {'If-None-Match': etag};
    }
  }

  // endregion

}
