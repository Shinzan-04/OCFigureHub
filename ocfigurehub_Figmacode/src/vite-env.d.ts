/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Web Components — model-viewer 3D viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': Record<string, unknown>;
    }
  }
}

export {};
