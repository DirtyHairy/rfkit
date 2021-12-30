import { AppState } from '../state/state';
import { ErrorMsg } from './error';
import { FunctionComponent } from 'react';
import { Loader } from './loader';
import React from 'react';

export interface Props {
    appState: AppState;
    onRetryLoad: () => void;
    onRetrySave: () => void;
    onRetryReboot: () => void;
}

export const Overlay: FunctionComponent<Props> = ({ appState, onRetryLoad, onRetrySave, onRetryReboot }) => {
    switch (appState) {
        case AppState.loading:
            return <Loader message="Loading"></Loader>;

        case AppState.loadError:
            return <ErrorMsg message="Unable to load device configuration." onRetry={onRetryLoad}></ErrorMsg>;

        case AppState.saving:
            return <Loader message="Saving"></Loader>;

        case AppState.saveError:
            return <ErrorMsg message="Unable to save device configuration." onRetry={onRetrySave}></ErrorMsg>;

        case AppState.rebooting:
            return <Loader message="Rebooting"></Loader>;

        case AppState.rebootError:
            return <ErrorMsg message="Failed to reboot device." onRetry={onRetryReboot}></ErrorMsg>;

        default:
            return null;
    }
};
