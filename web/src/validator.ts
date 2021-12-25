import { Config } from './state/config';

const MSG_MANDATORY = 'This field is mandatory.';
const MSG_BAD_HOSTNAME = 'Invalid hostname.';

export type Validator = (config: Config) => string | undefined;

export const name: Validator = (config) => (config.name.trim() === '' ? MSG_MANDATORY : undefined);

export const hostname: Validator = (config) => {
    if (config.hostname.trim() === '') {
        return MSG_MANDATORY;
    }

    if (!/^[a-z0-9][a-z0-9-]*$/.test(config.hostname)) {
        return MSG_BAD_HOSTNAME;
    }

    return undefined;
};
