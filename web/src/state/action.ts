import { Config, Switch } from './config';
import { Status } from './state';
export type ActionType =
    | 'resetConfig'
    | 'updateConfig'
    | 'updateName'
    | 'updateHostname'
    | 'setError'
    | 'updateSwitch'
    | 'addSwitch'
    | 'deleteSwitch'
    | 'updateStatus';

interface WithType {
    type: ActionType;
}
export interface ResetConfigAction extends WithType {
    type: 'resetConfig';
    config: Config;
}

export interface SetErrorAction extends WithType {
    type: 'setError';
    error: string;
}

export interface UpdateConfigAction extends WithType {
    type: 'updateConfig';
    changes: Partial<Omit<Config, 'switches'>>;
}

export interface UpdateSwitchAction extends WithType {
    type: 'updateSwitch';
    index: number;
    changes: Partial<Switch>;
}

export interface AddSwitchAction extends WithType {
    type: 'addSwitch';
}

export interface DeleteSwitchAction extends WithType {
    type: 'deleteSwitch';
    index: number;
}

export interface UpdateStatusAction extends WithType {
    type: 'updateStatus';
    status: Status;
}

export type Action =
    | ResetConfigAction
    | UpdateConfigAction
    | SetErrorAction
    | UpdateSwitchAction
    | AddSwitchAction
    | DeleteSwitchAction
    | UpdateStatusAction;
