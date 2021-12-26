import { Config } from './config';

export const enum AppState {
    loading,
    loadError,
    running,
    saving,
    saveError,
    rebooting,
    rebootError,
}

export interface Status {
    uptime: number;
    heap: number;
}

export interface State {
    config?: Config;
    remoteConfig?: Config;
    status?: Status;

    unreachable: boolean;
    appState: AppState;
}
