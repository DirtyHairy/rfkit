import { Action } from './action';
import { State } from './state';

export interface StateApi {
    state: State;
    dispatch: (action: Action) => void;
}
