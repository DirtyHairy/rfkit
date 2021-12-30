import './scss/container.scss';

import { FunctionComponent, ReactNode } from 'react';

import React from 'react';

export interface Props {
    children?: ReactNode;
}

export const Container: FunctionComponent = ({ children }: Props) => (
    <div className="container">
        <h1>RFKit configuration</h1>
        {children}
    </div>
);
