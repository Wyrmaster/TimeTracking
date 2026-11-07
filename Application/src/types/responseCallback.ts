import type {IResponse} from '../network/response.ts';

export type ResponseCallback<T> = ((response: IResponse<T>) => void|Promise<void>) | null;