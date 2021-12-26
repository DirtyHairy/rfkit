import { Config, Switch } from './config';
import { Status } from './state';

export const enum ActionType {
    resetConfig,
    updateConfig,
    updateName,
    updateHostname,
    setError,
    updateSwitch,
    addSwitch,
    deleteSwitch,
    updateStatus,
    setUnreachable,
}

interface WithType {
    type: ActionType;
}
export interface ResetConfigAction extends WithType {
    type: ActionType.resetConfig;
    config: Config;
}

export interface SetErrorAction extends WithType {
    type: ActionType.setError;
    error: string;
}

export interface UpdateConfigAction extends WithType {
    type: ActionType.updateConfig;
    changes: Partial<Omit<Config, 'switches'>>;
}

export interface UpdateSwitchAction extends WithType {
    type: ActionType.updateSwitch;
    index: number;
    changes: Partial<Switch>;
}

export interface AddSwitchAction extends WithType {
    type: ActionType.addSwitch;
}

export interface DeleteSwitchAction extends WithType {
    type: ActionType.deleteSwitch;
    index: number;
}

export interface UpdateStatusAction extends WithType {
    type: ActionType.updateStatus;
    status: Status;
}

export interface SetUnreachableAction extends WithType {
    type: ActionType.setUnreachable;
    unreachable: boolean;
}

export type Action =
    | ResetConfigAction
    | UpdateConfigAction
    | SetErrorAction
    | UpdateSwitchAction
    | AddSwitchAction
    | DeleteSwitchAction
    | UpdateStatusAction
    | SetUnreachableAction;
