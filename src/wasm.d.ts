// src/wasm.d.ts
declare module '*.wasm' {
    const content: any;
    export default content;
}

// This helps TS recognize the generated wasm-bindgen modules
declare module '*/snake_wasm' {
    export function get_greeting(): string;
    export default function init(): Promise<void>;
}