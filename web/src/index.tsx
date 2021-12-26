import { App } from './component/app';
import { Container } from './component/container';
import { render } from 'preact';

render(
    <Container>
        <App />
    </Container>,
    document.getElementById('app-root')!
);
