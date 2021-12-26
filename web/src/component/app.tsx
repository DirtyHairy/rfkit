import { FunctionComponent } from 'preact';
import { MutableRef, useEffect, useReducer, useRef } from 'preact/hooks';
import { Editor } from './editor';
import { reducer } from '../state/reducer';
import './scss/app.scss';
import { Loader } from './loader';
import { ActionType } from '../state/action';
import { deepEqual } from '../util';
import { StateApi } from '../state/state-api';
import { StatusCheck } from '../status-check';

async function loadConfig(api: MutableRef<StateApi>): Promise<void> {
    const response = await fetch('/api/config');

    api.current.dispatch(
        response.ok
            ? {
                  type: ActionType.resetConfig,
                  config: await response.json(),
              }
            : { type: ActionType.setError, error: 'failed to load config' }
    );
}

export const App: FunctionComponent = () => {
    const [state, dispatch] = useReducer(reducer, { unreachable: false });

    const stateApiRef = useRef<StateApi>({ state, dispatch });
    stateApiRef.current.state = state;
    stateApiRef.current.dispatch = dispatch;

    const statusCheckRef = useRef(new StatusCheck(stateApiRef));

    useEffect(() => statusCheckRef.current.start(), []);
    useEffect(() => loadConfig(stateApiRef), []);

    if (state.error) {
        return <div>ERROR: {state.error}</div>;
    } else if (!state.config) {
        return <Loader></Loader>;
    } else {
        return (
            <Editor
                config={state.config}
                dispatch={dispatch}
                status={state.status}
                unreachable={state.unreachable}
                isDirty={!deepEqual(state.config, state.remoteConfig)}
            />
        );
    }
};
