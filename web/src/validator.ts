import { Config } from './state/config';

const MSG_MANDATORY = 'This field is mandatory.';
const MSG_BAD_HOSTNAME = 'Invalid hostname.';
const MSG_BAD_CODE = 'Invalid code.';

export type Validator = (config: Config) => string | undefined;
export type BoolValidator = (config: Config) => boolean;

export const name: Validator = (config) => (config.name.trim() === '' ? MSG_MANDATORY : undefined);

export const hostname: Validator = (config) => {
    if (config.hostname.trim() === '') {
        return MSG_MANDATORY;
    }

    if (!/^[a-z0-9][a-z0-9-]*$/i.test(config.hostname)) {
        return MSG_BAD_HOSTNAME;
    }

    return undefined;
};

export const manufacturer: Validator = (config) => (config.manufacturer.trim() === '' ? MSG_MANDATORY : undefined);

export const serial: Validator = (config) => (config.serial.trim() === '' ? MSG_MANDATORY : undefined);

export const model: Validator = (config) => (config.model.trim() === '' ? MSG_MANDATORY : undefined);

export const revision: Validator = (config) => (config.revision.trim() === '' ? MSG_MANDATORY : undefined);

export const switchName: (index: number) => Validator = (index) => (config) => {
    const swtch = config.switches[index];
    if (!swtch) {
        return undefined;
    }

    return swtch.name.trim() === '' ? MSG_MANDATORY : undefined;
};

export const switchOn: (index: number) => Validator = (index) => (config) => {
    const swtch = config.switches[index];
    if (!swtch) {
        return undefined;
    }

    return validateCode(swtch.on);
};

export const switchOff: (index: number) => Validator = (index) => (config) => {
    const swtch = config.switches[index];
    if (!swtch) {
        return undefined;
    }

    return validateCode(swtch.off);
};

export const swtch: (index: number) => BoolValidator = (index) => (config) =>
    !(
        switchName(index)(config) !== undefined ||
        switchOn(index)(config) !== undefined ||
        switchOff(index)(config) !== undefined
    );

export const config: BoolValidator = (cfg) =>
    !(
        [name, manufacturer, hostname, manufacturer, serial, model, revision].some((v) => v(cfg) !== undefined) ||
        cfg.switches.some((_, i) => !swtch(i)(cfg))
    );

function validateCode(code: string): string | undefined {
    if (code.trim() === '') {
        return MSG_MANDATORY;
    }

    if (!/^[01F]*S?$/.test(code)) {
        return MSG_BAD_CODE;
    }

    return undefined;
}
