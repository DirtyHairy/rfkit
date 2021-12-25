import 'preact/hooks';

declare module 'preact/hooks' {
    export function useEffect(effect: () => Promise<void>, inputs?: Inputs): void;
}
