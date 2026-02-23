import {IActivityDto} from '../Activities/IActivityDto.ts';

export interface ITimeEntryDto {
  id: number;
  description: string;
  start: Date;
  end: Date|null;
  activity: IActivityDto|null;
}