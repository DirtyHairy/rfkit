import { Config } from './config';
import { Action, ActionType } from './action';
import { State } from './state';

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.resetConfig:
            return { ...state, config: action.config, remoteConfig: JSON.parse(JSON.stringify(action.config)) };

        case ActionType.updateStatus:
            return { ...state, status: action.status };

        case ActionType.setUnreachable:
            return { ...state, unreachable: action.unreachable };

        case ActionType.updateAppState:
            return { ...state, appState: action.appState };

        default:
            return { ...state, config: reduceConfig(state.config, action) };
    }
}

function reduceConfig(config: Config | undefined, action: Action): Config | undefined {
    if (config === undefined) {
        return config;
    }

    switch (action.type) {
        case ActionType.updateConfig:
            return { ...config, ...action.changes };

        case ActionType.updateSwitch:
            return {
                ...config,
                switches: config.switches.map((x, i) => (i === action.index ? { ...x, ...action.changes } : x)),
            };

        case ActionType.addSwitch:
            return { ...config, switches: [...config.switches, { name: '', on: '', off: '' }] };

        case ActionType.deleteSwitch:
            return { ...config, switches: config.switches.filter((_, i) => i !== action.index) };
    }
}
