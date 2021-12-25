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
        <label class={`rfkit-input ${props.invalid !== undefined ? 'invalid' : 'valid'}`}>
            <span class="label">{props.label}</span>
            <input
                value={props.value}
                maxLength={props.maxLength}
                onInput={(e) => props.onChange && props.onChange((e.target as HTMLInputElement).value)}
                placeholder={props.placeholder}
                spellcheck={false}
                autocomplete="0"
            ></input>
            {props.invalid !== undefined && <span class="validation-error">{props.invalid}</span>}
        </label>
    );
};
