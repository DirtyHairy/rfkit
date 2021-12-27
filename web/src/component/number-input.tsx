import { FunctionComponent } from 'preact';
import { Input } from './input';
import { useRef } from 'preact/hooks';

export interface Props {
    value: number | undefined;
    max?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    noFocus?: boolean;
    onChange?: (value: number | undefined) => void;
}

function normalizeValue(value: string, max: number | undefined = 1000000): number | undefined {
    if (!value) {
        return undefined;
    }

    value = value.replace(/^0/, '').replace(/\D/, '');

    return Math.min(parseInt(value, 10), max) || undefined;
}

export const NumberInput: FunctionComponent<Props> = (props) => {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <Input
            ref={ref}
            label={props.label}
            placeholder={props.placeholder}
            invalid={props.invalid}
            maxLength={props.max ? Math.floor(Math.log(props.max) / Math.log(10)) + 1 : undefined}
            value={props.value && props.value > 0 ? props.value.toString() : ''}
            onChange={(value) => {
                if (!props.onChange) {
                    return;
                }

                props.onChange(normalizeValue(value, props.max));
            }}
            pattern="[0-9]*"
            inputMode="numeric"
            noFocus={props.noFocus}
        ></Input>
    );
};
