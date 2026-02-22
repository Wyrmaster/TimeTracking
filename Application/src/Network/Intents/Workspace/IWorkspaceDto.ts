import {IIdDto} from '../IIdDto.ts';

/**
 * Interface for DTOs that represent a workspace
 */
export interface IWorkspaceDto extends IIdDto {
  name: string;
  description: string;
  isActive: boolean;
}