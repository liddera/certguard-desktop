/// <reference types="vite/client" />

interface IpcRenderer {
  on(...args: unknown[]): void;
  off(...args: unknown[]): void;
  send(...args: unknown[]): void;
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    deactivateSession?: () => Promise<void>;
  }
}

export {};