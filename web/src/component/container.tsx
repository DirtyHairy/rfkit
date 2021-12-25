import { ComponentChildren, FunctionComponent } from 'preact';
import './scss/container.scss';

export interface Props {
    children?: ComponentChildren;
}

export const Container: FunctionComponent = ({ children }: Props) => (
    <div class="container">
        <h1>RFKit configuration</h1>
        {children}
    </div>
);
