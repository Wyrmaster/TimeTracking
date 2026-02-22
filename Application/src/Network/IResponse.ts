export interface IResponse<T> {
  response: T | null;
  code: number;
}