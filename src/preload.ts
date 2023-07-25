// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";
import { type ElectronAPI } from "./API";

const api: ElectronAPI = {
    mpris: {
        onStatusChanged(cb: (event, status) => any): void {
            ipcRenderer.on("mpris-status", cb);
        },
    },
    lastfm: {},
    storage: {},
};

contextBridge.exposeInMainWorld("API", api);
