import { FunctionComponent } from 'preact';
import { MutableRef, useEffect, useReducer, useRef } from 'preact/hooks';
import { Editor } from './editor';
import { reducer } from '../state/reducer';
import './scss/app.scss';
import { Loader } from './loader';
import { State } from '../state/state';
import { Action } from '../state/action';

interface StateApi {
    state: State;
    dispatch: (action: Action) => void;
}

function scheduleStatusUpdates(api: MutableRef<StateApi>) {
    const updateStatus = async () => {
        if (api.current.state.rebooting) {
            return;
        }

        try {
            const response = await fetch('/api/status');

            if (response.ok) {
                api.current.dispatch({ type: 'updateStatus', status: await response.json() });
            } else {
                throw new Error('bad response');
            }
        } catch (e) {
            console.warn(`failed to fetch status: ${e}`);
        }
    };

    const worker = async () => {
        await updateStatus();

        let delay = (Math.floor(performance.now() / 3000) + 1) * 3000 - performance.now();
        if (delay < 1000) {
            delay += 3000;
        }

        setTimeout(worker, delay);
    };

    worker();
}

export const App: FunctionComponent = () => {
    const [state, dispatch] = useReducer(reducer, { rebooting: false });

    const stateApiRef = useRef<StateApi>({ state, dispatch });
    stateApiRef.current.state = state;
    stateApiRef.current.dispatch = dispatch;

    useEffect(() => scheduleStatusUpdates(stateApiRef), []);

    useEffect(async () => {
        const response = await fetch('/api/config');

        dispatch(
            response.ok
                ? {
                      type: 'resetConfig',
                      config: await response.json(),
                  }
                : { type: 'setError', error: 'failed to load config' }
        );
    }, []);

    if (state.error) {
        return <div>ERROR: {state.error}</div>;
    } else if (!state.config) {
        return <Loader></Loader>;
    } else {
        return <Editor config={state.config} dispatch={dispatch} status={state.status} />;
    }
};
