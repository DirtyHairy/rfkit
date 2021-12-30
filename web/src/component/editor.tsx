import './scss/editor.scss';

import * as validator from '../validator';

import { Action, ActionType } from '../state/action';

import { Config } from '../state/config';
import { FunctionComponent } from 'preact';
import { Input } from './input';
import { Status } from '../state/state';
import { StatusDisplay } from './status-display';
import { Switch } from './switch';

export interface Props {
    config: Config;
    status?: Status;
    isDirty: boolean;
    unreachable: boolean;
    dispatch: (action: Action) => void;
    onSave: () => void;
}

export const Editor: FunctionComponent<Props> = ({ config, dispatch, status, isDirty, unreachable, onSave }) => (
    <>
        <h2>General settings</h2>

        <Input
            value={config.name}
            maxLength={32}
            placeholder="enter controller name"
            label="Controller name:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { name: value } })}
            invalid={validator.name(config)}
        />

        <Input
            value={config.hostname}
            maxLength={32}
            placeholder="enter hostname"
            label="Hostname:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { hostname: value } })}
            invalid={validator.hostname(config)}
        />

        <Input
            value={config.manufacturer}
            maxLength={32}
            placeholder="enter manufacturer"
            label="Manufacturer:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { manufacturer: value } })}
        />

        <Input
            value={config.serial}
            maxLength={32}
            placeholder="enter serial"
            label="Serial:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { serial: value } })}
        />

        <Input
            value={config.model}
            maxLength={32}
            placeholder="enter model"
            label="Model:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { model: value } })}
        />

        <Input
            value={config.revision}
            maxLength={32}
            placeholder="enter revision"
            label="Revision:"
            onChange={(value) => dispatch({ type: ActionType.updateConfig, changes: { revision: value } })}
        />

        <h2 className="headline-switches">Switches</h2>

        {config.switches.map((_, i) => (
            <Switch key={i} config={config} index={i} dispatch={dispatch}></Switch>
        ))}

        <div className="editor-buttons">
            <button onClick={() => dispatch({ type: ActionType.addSwitch })}>Add switch</button>
            <button
                className={`btn-save ${status?.protect ? 'hidden' : ''}`}
                disabled={!isDirty || !validator.config(config)}
                onClick={onSave}
            >
                Save
            </button>
        </div>

        <StatusDisplay status={status} unreachable={unreachable}></StatusDisplay>
    </>
);
