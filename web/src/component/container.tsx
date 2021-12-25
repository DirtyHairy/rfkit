import { ComponentChildren, FunctionComponent } from 'preact';
import './scss/container.scss';

export interface Props {
    children?: ComponentChildren;
}

export const Container: FunctionComponent = ({ children }: Props) => (
    <div className="container">
        <h1>RFKit configuration</h1>
        {children}
    </div>
);
