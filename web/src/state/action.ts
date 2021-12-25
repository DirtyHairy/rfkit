import { Config } from './config';
export type ActionType = 'resetConfig' | 'updateConfig' | 'updateName' | 'updateHostname' | 'setError';

export interface ResetConfigAction {
    type: 'reset';
    config: Config;
}

export interface SetErrorAction {
    type: 'setError';
    error: string;
}

export interface UpdateConfigAction {
    type: 'updateConfig';
    changes: Partial<Omit<Config, 'switches'>>;
}

export type Action = ResetConfigAction | UpdateConfigAction | SetErrorAction;
