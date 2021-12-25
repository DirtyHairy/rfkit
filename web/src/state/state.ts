import { Config } from './config';

export interface Status {
    uptime: number;
    heap: number;
}

export interface State {
    config?: Config;
    remoteConfig?: Config;
    status?: Status;

    rebooting: boolean;
    error?: string;
}
