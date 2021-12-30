import { App } from './component/app';
import { Container } from './component/container';
import React from 'react';
import { render } from 'react-dom';

render(
    <Container>
        <App />
    </Container>,
    document.getElementById('app-root')!
);
