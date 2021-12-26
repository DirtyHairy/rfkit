import { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Backdrop } from './backdrop';
import './scss/error.scss';

export interface Props {
    message: string;
    onRetry?: () => void;
}

export const ErrorMsg: FunctionComponent<Props> = ({ message, onRetry }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Tab' && e.preventDefault();

        document.addEventListener('keydown', handler, true);
        if (buttonRef.current) {
            buttonRef.current.focus();
        }

        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    return (
        <>
            <Backdrop></Backdrop>
            <div className="error-container">
                <div className="error-message">
                    <h2>ERROR</h2>
                    {message}

                    {!!onRetry && (
                        <button ref={buttonRef} className="btn-error" onClick={onRetry}>
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
