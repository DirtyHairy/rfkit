import { Config } from './config';
import { Action } from './action';
import { State } from './state';

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'resetConfig':
            return { ...state, config: action.config };

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
            return { ...config, ...action.changes };

        case 'updateSwitchAction':
            return {
                ...config,
                switches: config.switches.map((x, i) => (i === action.index ? { ...x, ...action.changes } : x)),
            };
    }
}
