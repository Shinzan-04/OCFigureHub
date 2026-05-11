/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Khai báo cho thẻ <model-viewer>
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': any;
  }
}
