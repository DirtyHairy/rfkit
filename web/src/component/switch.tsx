import { FunctionComponent } from 'preact';
import { Action } from '../state/action';
import { Config } from '../state/config';
import { Input } from './input';
import './scss/switch.scss';
import * as validator from '../validator';
import { useState } from 'preact/hooks';

export interface Props {
    config: Config;
    index: number;
    dispatch: (action: Action) => void;
}

function normalizeNumber(value: string): number | undefined {
    value = value.replace(/^0+/, '').replace(/\D/, '').substring(0, 6);

    return value ? parseInt(value.replace(/\D/, ''), 10) : undefined;
}

export const Switch: FunctionComponent<Props> = ({ config, index, dispatch }) => {
    const [expanded, setExpanded] = useState(false);

    const swtch = config.switches[index];
    if (!swtch) {
        return null;
    }

    const isValid = validator.swtch(index)(config);

    return (
        <div className={`switch ${expanded ? 'expanded' : 'collapsed'} ${isValid ? 'valid' : 'invalid'}`}>
            <h3 className="headline">
                {swtch.name || `Switch ${index}`}
                <button className="expander" onClick={() => setExpanded(!expanded)}>
                    {'\u25B2'}
                </button>
            </h3>
            <div className="switch-settings">
                <Input
                    label="Name:"
                    placeholder="enter switch name"
                    value={swtch.name}
                    maxLength={32}
                    invalid={validator.switchName(index)(config)}
                    onChange={(value) =>
                        dispatch({ type: 'updateSwitchAction', index: index, changes: { name: value } })
                    }
                ></Input>

                <Input
                    label='Code for "on"'
                    placeholder='enter code for "on"'
                    value={swtch.on}
                    maxLength={64}
                    invalid={validator.switchOn(index)(config)}
                    onChange={(value) => dispatch({ type: 'updateSwitchAction', index: index, changes: { on: value } })}
                ></Input>

                <Input
                    label='Code for "off"'
                    placeholder='enter code for "off"'
                    value={swtch.off}
                    maxLength={64}
                    invalid={validator.switchOff(index)(config)}
                    onChange={(value) =>
                        dispatch({ type: 'updateSwitchAction', index: index, changes: { off: value } })
                    }
                ></Input>

                <Input
                    label="Pulse length:"
                    placeholder="enter pulse length (empty for default)"
                    value={swtch.pulseLength?.toString() || ''}
                    maxLength={6}
                    number={true}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitchAction',
                            index: index,
                            changes: {
                                pulseLength: normalizeNumber(value),
                            },
                        })
                    }
                ></Input>

                <Input
                    label="Protocol:"
                    placeholder="enter protocol type (empty for default)"
                    value={swtch.protocol?.toString() || ''}
                    maxLength={2}
                    number={true}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitchAction',
                            index: index,
                            changes: {
                                protocol: normalizeNumber(value),
                            },
                        })
                    }
                ></Input>

                <Input
                    label="Repeat:"
                    placeholder="enter repeat (empty for default)"
                    value={swtch.repeat?.toString() || ''}
                    maxLength={2}
                    number={true}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitchAction',
                            index: index,
                            changes: {
                                repeat: normalizeNumber(value),
                            },
                        })
                    }
                ></Input>
            </div>

            <div className="buttons">
                <button className="btn-on" disabled={!isValid}>
                    On
                </button>
                <button className="btn-off" disabled={!isValid}>
                    Off
                </button>
                <button className="btn-delete">Delete</button>
            </div>
        </div>
    );
};
