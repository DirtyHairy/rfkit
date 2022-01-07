import './scss/switch.scss';

import * as validator from '../validator';

import { Action, ActionType } from '../state/action';
import { FunctionComponent, useState } from 'react';

import { Config } from '../state/config';
import { ErrorMsg } from './error';
import { Input } from './input';
import { Loader } from './loader';
import { NumberInput } from './number-input';
import React from 'react';

export interface Props {
    config: Config;
    index: number;
    dispatch: (action: Action) => void;
}

const enum CommandState {
    none,
    sending,
    error,
}

export const Switch: FunctionComponent<Props> = ({ config, index, dispatch }) => {
    const [expanded, setExpanded] = useState(config.switches[index]?.name === '');
    const [commandState, setCommandState] = useState(CommandState.none);

    const swtch = config.switches[index];
    if (!swtch) {
        return null;
    }

    const sendCommand = async (code: string): Promise<void> => {
        setCommandState(CommandState.sending);

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    pulseLength: swtch.pulseLength,
                    protocol: swtch.protocol,
                    repeat: swtch.repeat,
                }),
            });

            if (!response.ok) {
                throw Error();
            }

            setCommandState(CommandState.none);
        } catch (e) {
            setCommandState(CommandState.error);
        }
    };

    return (
        <div
            className={`switch ${expanded ? 'expanded' : 'collapsed'} ${
                validator.swtch(index)(config) ? 'valid' : 'invalid'
            }`}
        >
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
                    onChange={(value) =>
                        dispatch({ type: ActionType.updateSwitch, index: index, changes: { name: value } })
                    }
                ></Input>

                <Input
                    label='Code for "on"'
                    placeholder='enter code for "on"'
                    value={swtch.on}
                    maxLength={32}
                    invalid={validator.switchOn(index)(config)}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({ type: ActionType.updateSwitch, index: index, changes: { on: value } })
                    }
                ></Input>

                <Input
                    label='Code for "off"'
                    placeholder='enter code for "off"'
                    value={swtch.off}
                    maxLength={32}
                    invalid={validator.switchOff(index)(config)}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({ type: ActionType.updateSwitch, index: index, changes: { off: value } })
                    }
                ></Input>

                <NumberInput
                    label="Pulse length:"
                    placeholder="enter pulse length (empty for default)"
                    value={swtch.pulseLength}
                    max={999}
                    noFocus={!expanded}
                    onChange={(value) =>
                        dispatch({
                            type: ActionType.updateSwitch,
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
                            type: ActionType.updateSwitch,
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
                            type: ActionType.updateSwitch,
                            index: index,
                            changes: {
                                repeat: value,
                            },
                        })
                    }
                ></NumberInput>
            </div>

            {commandState === CommandState.sending && <Loader message="sending"></Loader>}
            {commandState === CommandState.error && (
                <ErrorMsg
                    message="Failed to send command."
                    onClose={() => setCommandState(CommandState.none)}
                ></ErrorMsg>
            )}

            <div className="switch-buttons">
                <button
                    className="btn-on"
                    disabled={!!validator.switchOn(index)(config)}
                    onClick={() => sendCommand(swtch.on)}
                >
                    On
                </button>
                <button
                    className="btn-off"
                    disabled={!!validator.switchOff(index)(config)}
                    onClick={() => sendCommand(swtch.off)}
                >
                    Off
                </button>
                <button className="btn-delete" onClick={() => dispatch({ type: ActionType.deleteSwitch, index })}>
                    Delete
                </button>
            </div>
        </div>
    );
};
