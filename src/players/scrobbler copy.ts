import { type Metadata, PlaybackStatus } from "./mpris/dbus-types";
import { MprisPlayer } from "./mpris/player";
import { Emitter } from "./util";

interface PlayerScrobblerEvents {
    scrobble: (playerName: string, metadata: Metadata) => void;
}

export class PlayerScrobbler extends Emitter<PlayerScrobblerEvents> {
    protected scrobbling = false;

    protected currentlyTracking?: {
        id: string;
        length: number;
        timeoutToScrobble?: NodeJS.Timeout;
    } = undefined;

    protected newTrack(metadata: Metadata) {
        console.log(
            `${this.player.name} scrobbling ${metadata["xesam:title"]}`
        );

        if (this.currentlyTracking?.timeoutToScrobble) {
            clearTimeout(this.currentlyTracking.timeoutToScrobble);
        }

        this.scrobbling = true;
        this.currentlyTracking = {
            id: metadata["mpris:trackid"],
            length: metadata["mpris:length"] ?? 10 * 60 * 1000_000,
        };
    }

    protected playbackStateChanged(state: PlaybackStatus) {
        console.log({ player: this.player.name, state });

        switch (state) {
            case PlaybackStatus.Playing:
                this.newTrack(this.player.Metadata);
                if (!this.currentlyTracking) break;
                const currentPosition = this.player.Position;
                const scrobbleIn =
                    (this.currentlyTracking.length - currentPosition) / 1000;
                this.currentlyTracking.timeoutToScrobble = setTimeout(
                    this.scrobble.bind(this),
                    scrobbleIn
                );
                console.log(
                    `${this.player.name} scrobbling in ${
                        scrobbleIn / 1000
                    } seconds`
                );
                break;
            case PlaybackStatus.Paused:
                this.scrobbling = false;
                if (this.currentlyTracking?.timeoutToScrobble) {
                    clearTimeout(this.currentlyTracking.timeoutToScrobble);
                    console.log(
                        `${this.player.name} scrobble timeout cancelled`
                    );
                }
                break;
            case PlaybackStatus.Stopped:
                this.scrobbling = false;
                if (this.currentlyTracking?.timeoutToScrobble) {
                    clearTimeout(this.currentlyTracking.timeoutToScrobble);
                    console.log(
                        `${this.player.name} scrobble timeout cancelled`
                    );
                }
        }
    }

    protected scrobble() {
        this.emit("scrobble", this.player.name, this.player.Metadata);
    }

    public constructor(protected player: MprisPlayer) {
        super();

        // this.scrobbling

        this.playbackStateChanged(this.player.PlaybackStatus);
        // this.newTrack(this.player.Metadata);

        this.player.on("metadatachange", this.newTrack.bind(this));
        this.player.on(
            "playbackstatechange",
            this.playbackStateChanged.bind(this)
        );
    }
}
