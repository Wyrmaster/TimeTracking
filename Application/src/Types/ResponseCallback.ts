import {IResponse} from '../Network/IResponse.ts';

export type ResponseCallback<T> = ((response: IResponse<T>) => void|Promise<void>) | null;