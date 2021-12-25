export interface Config {
    name: string;
    hostname: string;
    manufacturer: string;
    serial: string;
    model: string;
    revision: string;

    switches: Array<Switch>;
}

export interface Switch {
    name: string;
    on: string;
    off: string;
    pulseLength: number;
    protocol: number;
    repeat: number;
}
