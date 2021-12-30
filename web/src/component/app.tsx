import './scss/app.scss';

import { FunctionComponent, useEffect, useReducer, useRef } from 'react';
import { loadConfig, reboot, saveConfig } from '../effect';

import { AppState } from '../state/state';
import { Editor } from './editor';
import { Overlay } from './overlay';
import React from 'react';
import { StateApi } from '../state/state-api';
import { StatusCheck } from '../status-check';
import { deepEqual } from '../util';
import { reducer } from '../state/reducer';

export const App: FunctionComponent = () => {
    const [state, dispatch] = useReducer(reducer, { appState: AppState.loading, unreachable: false });

    const stateApiRef = useRef<StateApi>({ state, dispatch });
    stateApiRef.current.state = state;
    stateApiRef.current.dispatch = dispatch;

    const statusCheckRef = useRef(new StatusCheck(stateApiRef));

    useEffect(() => statusCheckRef.current.start(), []);
    useEffect(() => {
        loadConfig(stateApiRef);
    }, []);

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
