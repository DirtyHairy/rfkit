import { Config, Switch } from './config';
import { AppState, Status } from './state';

export const enum ActionType {
    resetConfig,
    updateConfig,
    updateName,
    updateHostname,
    updateSwitch,
    addSwitch,
    deleteSwitch,
    updateStatus,
    setUnreachable,
    updateAppState,
}

interface WithType {
    type: ActionType;
}
export interface ResetConfigAction extends WithType {
    type: ActionType.resetConfig;
    config: Config;
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

export interface UpdateAppStateAction extends WithType {
    type: ActionType.updateAppState;
    appState: AppState;
}

export type Action =
    | ResetConfigAction
    | UpdateConfigAction
    | UpdateSwitchAction
    | AddSwitchAction
    | DeleteSwitchAction
    | UpdateStatusAction
    | SetUnreachableAction
    | UpdateAppStateAction;
