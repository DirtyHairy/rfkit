import { MutableRef } from 'preact/hooks';
import { ActionType } from './state/action';
import { AppState } from './state/state';
import { StateApi } from './state/state-api';
import { StatusCheck } from './status-check';

export async function loadConfig(api: MutableRef<StateApi>): Promise<void> {
    api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.loading });

    try {
        const response = await fetch('/api/config');

        if (response.ok) {
            api.current.dispatch({ type: ActionType.resetConfig, config: await response.json() });
        } else {
            throw new Error();
        }

        api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.running });
    } catch (e) {
        api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.loadError });
    }
}

export async function reboot(api: MutableRef<StateApi>, statusCheck: MutableRef<StatusCheck>): Promise<void> {
    api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.rebooting });

    try {
        await statusCheck.current.stop();
        api.current.dispatch({ type: ActionType.setUnreachable, unreachable: true });

        const response = await fetch('/api/reboot', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error();
        }

        await new Promise((r) => setTimeout(r, 1000));

        statusCheck.current.start();
        while (api.current.state.unreachable) {
            await new Promise((r) => setTimeout(r, 250));
        }

        await loadConfig(api);
    } catch (e) {
        api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.rebootError });
    }
}

export async function saveConfig(api: MutableRef<StateApi>, statusCheck: MutableRef<StatusCheck>): Promise<void> {
    api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.saving });

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(api.current.state.config),
        });

        if (!response.ok) {
            throw new Error();
        }

        await reboot(api, statusCheck);
    } catch (e) {
        api.current.dispatch({ type: ActionType.updateAppState, appState: AppState.saveError });
    }
}
