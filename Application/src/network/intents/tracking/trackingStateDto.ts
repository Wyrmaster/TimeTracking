/**
 * Dto describing a lightweight fingerprint of the tracking state of the user
 */
export interface ITrackingStateDto {
  version: string;
  activeActivityId: number|null;
}
