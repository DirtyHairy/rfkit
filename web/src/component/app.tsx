import { FunctionComponent } from 'preact';
import { useEffect, useReducer } from 'preact/hooks';
import { Editor } from './editor';
import { reducer } from '../state/reducer';
import './scss/app.scss';

export const App: FunctionComponent = () => {
    const [state, dispatch] = useReducer(reducer, {});

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
        return <div>Loading...</div>;
    } else {
        return <Editor config={state.config} dispatch={dispatch} />;
    }
};
