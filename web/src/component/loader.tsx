import './scss/loader.scss';

import { Backdrop } from './backdrop';
import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

export interface Props {
    message?: string;
}

export const Loader: FunctionComponent<Props> = ({ message }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Tab' && e.preventDefault();

        document.addEventListener('keydown', handler, true);
        document.body.focus();

        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    return (
        <>
            <Backdrop></Backdrop>
            <div className="loader-container">
                <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div className="loader-message">{message}</div>
            </div>
        </>
    );
};
