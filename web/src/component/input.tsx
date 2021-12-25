import { FunctionComponent } from 'preact';
import './scss/input.scss';

export interface Props {
    value: string;
    maxLength?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    onChange?: (value: string) => void;
}

export const Input: FunctionComponent<Props> = (props: Props) => {
    return (
        <label className={`rfkit-input ${props.invalid !== undefined ? 'invalid' : 'valid'}`}>
            <span className="label">{props.label}</span>
            <input
                value={props.value}
                maxLength={props.maxLength}
                onInput={(e) => props.onChange && props.onChange((e.target as HTMLInputElement).value)}
                placeholder={props.placeholder}
                spellCheck={false}
                autoComplete="0"
            ></input>
            {props.invalid !== undefined && <span className="validation-error">{props.invalid}</span>}
        </label>
    );
};
