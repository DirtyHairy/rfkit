import { Config, Switch } from './config';
export type ActionType =
    | 'resetConfig'
    | 'updateConfig'
    | 'updateName'
    | 'updateHostname'
    | 'setError'
    | 'updateSwitchAction';

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
    type: 'updateSwitchAction';
    index: number;
    changes: Partial<Switch>;
}

export type Action = ResetConfigAction | UpdateConfigAction | SetErrorAction | UpdateSwitchAction;
