import './scss/container.scss';

import { ComponentChildren, FunctionComponent } from 'preact';

export interface Props {
    children?: ComponentChildren;
}

export const Container: FunctionComponent = ({ children }: Props) => (
    <div className="container">
        <h1>RFKit configuration</h1>
        {children}
    </div>
);
