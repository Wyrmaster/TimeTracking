/**
 * Request to change the password of the authenticated user
 */
export interface IChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
