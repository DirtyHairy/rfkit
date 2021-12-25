import { FunctionComponent } from 'preact';
import './scss/input.scss';

export interface Props {
    value: string;
    maxLength?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    type?: string;
    noFocus?: boolean;
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
                // eslint-disable-next-line
                spellCheck={'false' as any}
                type={props.type}
                autoComplete="0"
                tabIndex={props.noFocus ? -1 : undefined}
            ></input>
            {props.invalid !== undefined && <span className="validation-error">{props.invalid}</span>}
        </label>
    );
};
