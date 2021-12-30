import './scss/status-display.scss';

import { FunctionComponent } from 'preact';
import { Status } from '../state/state';

export interface Props {
    status?: Status;
    unreachable: boolean;
}

function formatUptime(uptime: number) {
    const days = Math.floor(uptime / 3600 / 24);
    uptime -= days * 3600 * 24;

    const hours = Math.floor(uptime / 3600);
    uptime -= hours * 3600;

    const minutes = Math.floor(uptime / 60);
    uptime -= minutes * 60;

    return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${
        minutes > 0 ? minutes + 'm ' : ''
    }${uptime}s`;
}

export const StatusDisplay: FunctionComponent<Props> = ({ status, unreachable }) =>
    status ? (
        <div className={`status-display`}>
            {unreachable
                ? 'device unreachable'
                : `uptime: ${formatUptime(status.uptime)} | free heap: ${status.heap} bytes${
                      status.protect ? ' | write-protect on' : ''
                  }`}
        </div>
    ) : null;
