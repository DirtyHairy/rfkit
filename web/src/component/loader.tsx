import { FunctionComponent } from 'preact';
import './scss/loader.scss';

export const Loader: FunctionComponent = () => (
    <div className="loader-backdrop">
        <div className="loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
);
