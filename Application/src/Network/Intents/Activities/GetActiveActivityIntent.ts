import {Intent} from '../../Intent.ts';
import {IActiveActivityDto} from './IActiveActivityDto.ts';
import {HttpMethod} from '../../HttpMethod.ts';

export class GetActiveActivityIntent extends Intent<IActiveActivityDto> {

  // region Constructor

  constructor() {
    super(`/api/v1/activity/active/`, HttpMethod.GET);
  }

  // endregion

}