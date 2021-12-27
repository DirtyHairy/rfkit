import './scss/input.scss';

import { FunctionComponent } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface Props {
    value: string;
    maxLength?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    noFocus?: boolean;
    inputMode?: string;
    pattern?: string;
    onChange?: (value: string) => void;
}

export const Input: FunctionComponent<Props> = (props: Props) => {
    return (
        <label className={`rfkit-input ${props.invalid !== undefined ? 'invalid' : 'valid'}`}>
            <span className="label">{props.label}</span>
            <input
                onInput={(e) => props.onChange && props.onChange((e.target as HTMLInputElement).value)}
                // eslint-disable-next-line
                spellCheck={'false' as any}
                autoComplete="0"
                tabIndex={props.noFocus ? -1 : undefined}
                value={props.value}
                maxLength={props.maxLength}
                placeholder={props.placeholder}
                pattern={props.pattern}
                inputMode={props.inputMode}
            ></input>
            {props.invalid !== undefined && <span className="validation-error">{props.invalid}</span>}
        </label>
    );
};
