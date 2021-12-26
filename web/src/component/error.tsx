import { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Backdrop } from './backdrop';
import './scss/error.scss';

export interface Props {
    message: string;
    onRetry?: () => void;
    onClose?: () => void;
}

export const ErrorMsg: FunctionComponent<Props> = ({ message, onRetry, onClose }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                buttonRef.current?.focus();
                e.preventDefault();
            }

            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handler, true);
        buttonRef.current?.focus();

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
                        <button ref={buttonRef} onClick={onRetry}>
                            Retry
                        </button>
                    )}
                    {!!onClose && (
                        <button ref={buttonRef} onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
