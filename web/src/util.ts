// eslint-disable-next-line
export function deepEqual(x: any, y: any): boolean {
    if (Array.isArray(x)) {
        if (!Array.isArray(y) || x.length !== y.length) {
            return false;
        }

        return !x.some((elt, i) => !deepEqual(elt, y[i]));
    }

    if (x !== null && typeof x === 'object') {
        if (y === null || typeof y !== 'object' || Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }

        return !Object.keys(x).some(
            (key) => !Object.prototype.hasOwnProperty.call(y, key) || !deepEqual(x[key], y[key])
        );
    }

    return x === y;
}
