import { Fragment, FunctionComponent, render } from 'preact';
import { useState } from 'preact/hooks';

const App: FunctionComponent = () => {
    const [value, setValue] = useState('abc');

    return (
        <Fragment>
            <h1>Hello from RFkit!</h1>
        </Fragment>
    );
};

render(<App></App>, document.getElementById('app-root')!);
