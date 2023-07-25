import { type IpcRendererEvent } from "electron";
import { Metadata, PlaybackStatus } from "./players/mpris/dbus-types";

export interface PlayerStatus {
    metadata: Metadata;
    progress: number;
}

export type ElectronAPI = {
    mpris: {
        onStatusChanged(
            cb: (event: IpcRendererEvent, status: PlayerStatus | null) => void
        ): void;
    };
    lastfm: {};
    storage: {};
};
