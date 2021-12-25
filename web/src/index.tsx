import { render } from 'preact';
import { App } from './component/app';
import { Container } from './component/container';

render(
    <Container>
        <App />
    </Container>,
    document.getElementById('app-root')!
);
