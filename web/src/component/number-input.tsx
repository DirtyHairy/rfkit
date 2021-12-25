import { FunctionComponent } from 'preact';
import { Input } from './input';

export interface Props {
    value: number | undefined;
    max?: number;
    placeholder: string;
    label: string;
    invalid?: string | undefined;
    noFocus?: boolean;
    onChange?: (value: number | undefined) => void;
}

export const NumberInput: FunctionComponent<Props> = (props) => (
    <Input
        label={props.label}
        placeholder={props.placeholder}
        invalid={props.invalid}
        maxLength={props.max ? Math.floor(Math.log(props.max) / Math.log(10)) + 1 : undefined}
        value={props.value && props.value > 0 ? props.value.toString() : ''}
        onChange={(value) => {
            if (!props.onChange) {
                return;
            }

            if (!value) {
                props.onChange(undefined);
            }

            const numericValue = parseInt(value, 10);
            if (isNaN(numericValue)) {
                props.onChange(undefined);
            }

            props.onChange(Math.max(0, props.max ? Math.min(props.max, numericValue) : numericValue));
        }}
        noFocus={props.noFocus}
        type="number"
    ></Input>
);
