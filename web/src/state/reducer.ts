import { Config } from './config';
import { Action } from './action';
import { State } from './state';

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'resetConfig':
            return { ...state, config: action.config, remoteConfig: JSON.parse(JSON.stringify(action.config)) };

        case 'updateStatus':
            return { ...state, status: action.status };

        default:
            return { ...state, config: reduceConfig(state.config, action) };
    }
}

function reduceConfig(config: Config | undefined, action: Action) {
    if (config === undefined) {
        return config;
    }

    switch (action.type) {
        case 'updateConfig':
            return { ...config, ...action.changes } as Config;

        case 'updateSwitch':
            return {
                ...config,
                switches: config.switches.map((x, i) => (i === action.index ? { ...x, ...action.changes } : x)),
            } as Config;

        case 'addSwitch':
            return { ...config, switches: [...config.switches, { name: '', on: '', off: '' }] } as Config;

        case 'deleteSwitch':
            return { ...config, switches: config.switches.filter((_, i) => i !== action.index) } as Config;
    }
}
