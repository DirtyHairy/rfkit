import { ActionType } from './state/action';
import { MutableRefObject } from 'react';
import { Mutex } from 'async-mutex';
import { StateApi } from './state/state-api';

export class StatusCheck {
    constructor(private api: MutableRefObject<StateApi>) {}

    start(): void {
        if (this.running) {
            return;
        }

        this.running = true;
        this.timestampAtStart = performance.now();
        this.worker();
    }

    async stop(): Promise<void> {
        if (!this.running) {
            return;
        }

        this.mutex.runExclusive(() => clearTimeout(this.handle));

        this.running = false;
    }

    private updateStatus = async (): Promise<void> => {
        try {
            const controller = new AbortController();
            const timeoutHandle = window.setTimeout(() => controller.abort(), 1500);

            const response = await fetch('/api/status', { signal: controller.signal });

            clearTimeout(timeoutHandle);

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

    private worker = () =>
        this.mutex.runExclusive(async (): Promise<void> => {
            await this.updateStatus();

            const timestamp = performance.now() - this.timestampAtStart;

            let delay = (Math.floor(timestamp / 3000) + 1) * 3000 - timestamp;
            if (delay < 500) {
                delay += 3000;
            }

            this.handle = window.setTimeout(this.worker, delay);
        });

    private handle: number | undefined;
    private running = false;
    private timestampAtStart = 0;
    private mutex = new Mutex();
}
