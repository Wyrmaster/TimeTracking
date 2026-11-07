import {Intent} from '../../intent.ts';
import type {IActiveActivityDto} from './activeActivityDto.ts';
import {HttpMethod} from '../../httpMethod.ts';

export class GetActiveActivityIntent extends Intent<IActiveActivityDto> {

  // region Constructor

  constructor() {
    super(`/api/v1/activity/active/`, HttpMethod.GET);
  }

  // endregion

}