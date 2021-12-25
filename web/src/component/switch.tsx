import { FunctionComponent } from 'preact';
import { Action } from '../state/action';
import { Config } from '../state/config';
import { Input } from './input';
import './scss/switch.scss';
import * as validator from '../validator';
import { useState } from 'preact/hooks';
import { NumberInput } from './number-input';

export interface Props {
    config: Config;
    index: number;
    dispatch: (action: Action) => void;
}

export const Switch: FunctionComponent<Props> = ({ config, index, dispatch }) => {
    const [expanded, setExpanded] = useState(config.switches[index]?.name === '');

    const swtch = config.switches[index];
    if (!swtch) {
        return null;
    }

    const isValid = validator.swtch(index)(config);

    return (
        <div className={`switch ${expanded ? 'expanded' : 'collapsed'} ${isValid ? 'valid' : 'invalid'}`}>
            <h3 className="headline">
                {swtch.name || `Switch ${index}`}
                <button tabIndex={-1} className="expander" onClick={() => setExpanded(!expanded)}>
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
                    noFocus={!expanded}
                    onChange={(value) => dispatch({ type: 'updateSwitch', index: index, changes: { name: value } })}
                ></Input>

                <Input
                    label='Code for "on"'
                    placeholder='enter code for "on"'
                    value={swtch.on}
                    maxLength={64}
                    invalid={validator.switchOn(index)(config)}
                    noFocus={!expanded}
                    onChange={(value) => dispatch({ type: 'updateSwitch', index: index, changes: { on: value } })}
                ></Input>

                <Input
                    label='Code for "off"'
                    placeholder='enter code for "off"'
                    value={swtch.off}
                    maxLength={64}
                    invalid={validator.switchOff(index)(config)}
                    noFocus={!expanded}
                    onChange={(value) => dispatch({ type: 'updateSwitch', index: index, changes: { off: value } })}
                ></Input>

                <NumberInput
                    label="Pulse length:"
                    placeholder="enter pulse length (empty for default)"
                    value={swtch.pulseLength}
                    max={999}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitch',
                            index: index,
                            changes: {
                                pulseLength: value,
                            },
                        })
                    }
                ></NumberInput>

                <NumberInput
                    label="Protocol:"
                    placeholder="enter protocol type (empty for default)"
                    value={swtch.protocol}
                    max={20}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitch',
                            index: index,
                            changes: {
                                protocol: value,
                            },
                        })
                    }
                ></NumberInput>

                <NumberInput
                    label="Repeat:"
                    placeholder="enter repeat (empty for default)"
                    value={swtch.repeat}
                    max={99}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({
                            type: 'updateSwitch',
                            index: index,
                            changes: {
                                repeat: value,
                            },
                        })
                    }
                ></NumberInput>
            </div>

            <div className="switch-buttons">
                <button className="btn-on" disabled={!!validator.switchOn(index)(config)}>
                    On
                </button>
                <button className="btn-off" disabled={!!validator.switchOff(index)(config)}>
                    Off
                </button>
                <button className="btn-delete" onClick={() => dispatch({ type: 'deleteSwitch', index })}>
                    Delete
                </button>
            </div>
        </div>
    );
};
