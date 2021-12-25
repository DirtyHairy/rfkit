import { FunctionComponent } from 'preact';
import { Action } from '../state/action';
import { Config } from '../state/config';
import { Input } from './input';
import * as validator from '../validator';
import './scss/editor.scss';

export interface Props {
    config: Config;
    dispatch: (action: Action) => void;
}

export const Editor: FunctionComponent<Props> = ({ config, dispatch }) => (
    <>
        <h2>General settings</h2>

        <Input
            value={config.name}
            maxLength={32}
            placeholder="enter controller name"
            label="Controller name:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { name: value } })}
            invalid={validator.name(config)}
        />

        <Input
            value={config.hostname}
            maxLength={32}
            placeholder="enter hostname"
            label="Hostname:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { hostname: value } })}
            invalid={validator.hostname(config)}
        />

        <Input
            value={config.manufacturer}
            maxLength={32}
            placeholder="enter manufacturer"
            label="Manufacturer:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { manufacturer: value } })}
        />

        <Input
            value={config.serial}
            maxLength={32}
            placeholder="enter serial"
            label="Serial:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { serial: value } })}
        />

        <Input
            value={config.model}
            maxLength={32}
            placeholder="enter model"
            label="Model:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { model: value } })}
        />

        <Input
            value={config.revision}
            maxLength={32}
            placeholder="enter revision"
            label="Revision:"
            onChange={(value) => dispatch({ type: 'updateConfig', changes: { revision: value } })}
        />

        <h2 class="headline-switches">Switches</h2>
    </>
);
