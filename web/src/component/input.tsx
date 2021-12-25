import { FunctionComponent } from 'preact';
import './scss/input.scss';

export interface Props {
    value: string;
    maxLength?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    number?: boolean;
    onChange?: (value: string) => void;
}

export const Input: FunctionComponent<Props> = (props: Props) => {
    return (
        <label className={`rfkit-input ${props.invalid !== undefined ? 'invalid' : 'valid'}`}>
            <span className="label">{props.label}</span>
            <input
                value={props.value}
                maxLength={props.number ? undefined : props.maxLength}
                max={props.number && props.maxLength ? 10 ** props.maxLength - 1 : undefined}
                min={props.number ? 0 : undefined}
                onInput={(e) => props.onChange && props.onChange((e.target as HTMLInputElement).value)}
                placeholder={props.placeholder}
                spellCheck={false}
                autoComplete="0"
                type={props.number ? 'number' : undefined}
            ></input>
            {props.invalid !== undefined && <span className="validation-error">{props.invalid}</span>}
        </label>
    );
};
