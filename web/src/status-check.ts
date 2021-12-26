import { MutableRef } from 'preact/hooks';
import { ActionType } from './state/action';
import { StateApi } from './state/state-api';

export class StatusCheck {
    constructor(private api: MutableRef<StateApi>) {}

    start(): void {
        if (this.running) {
            return;
        }

        this.running = true;
        this.worker();
    }

    async stop(): Promise<void> {
        if (!this.running) {
            return;
        }

        await this.currentRequest;
        clearTimeout(this.handle);

        this.running = false;
    }

    private updateStatus = async (): Promise<void> => {
        try {
            const response = await fetch('/api/status');

            if (response.ok) {
                this.api.current.dispatch({ type: ActionType.updateStatus, status: await response.json() });
            } else {
                throw new Error('bad response');
            }

            this.api.current.dispatch({ type: ActionType.setUnreachable, unreachable: false });
        } catch (e) {
            console.warn(`failed to fetch status: ${e}`);
            this.api.current.dispatch({ type: ActionType.setUnreachable, unreachable: true });
        }
    };

    private worker = async (): Promise<void> => {
        this.currentRequest = this.updateStatus();
        await this.currentRequest;

        let delay = (Math.floor(performance.now() / 3000) + 1) * 3000 - performance.now();
        if (delay < 1000) {
            delay += 3000;
        }

        this.handle = window.setTimeout(this.worker, delay);
    };

    private handle: number | undefined;
    private running = false;
    private currentRequest: Promise<void> = Promise.resolve();
}
