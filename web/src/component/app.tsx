import { FunctionComponent } from 'preact';
import { useEffect, useReducer, useRef } from 'preact/hooks';
import { Editor } from './editor';
import { reducer } from '../state/reducer';
import './scss/app.scss';
import { Loader } from './loader';
import { deepEqual } from '../util';
import { StateApi } from '../state/state-api';
import { StatusCheck } from '../status-check';
import { AppState } from '../state/state';
import { ErrorMsg } from './error';
import { loadConfig, reboot, saveConfig } from '../effect';
import { Overlay } from './overlay';

export const App: FunctionComponent = () => {
    const [state, dispatch] = useReducer(reducer, { appState: AppState.loading, unreachable: false });

    const stateApiRef = useRef<StateApi>({ state, dispatch });
    stateApiRef.current.state = state;
    stateApiRef.current.dispatch = dispatch;

    const statusCheckRef = useRef(new StatusCheck(stateApiRef));

    useEffect(() => statusCheckRef.current.start(), []);
    useEffect(() => loadConfig(stateApiRef), []);

    return (
        <>
            <Overlay
                appState={state.appState}
                onRetryLoad={() => loadConfig(stateApiRef)}
                onRetryReboot={() => reboot(stateApiRef, statusCheckRef)}
                onRetrySave={() => saveConfig(stateApiRef, statusCheckRef)}
            ></Overlay>
            {!!state.config && (
                <Editor
                    config={state.config!}
                    dispatch={dispatch}
                    status={state.status}
                    unreachable={state.unreachable}
                    isDirty={!deepEqual(state.config, state.remoteConfig)}
                    onSave={() => saveConfig(stateApiRef, statusCheckRef)}
                />
            )}
        </>
    );
};
