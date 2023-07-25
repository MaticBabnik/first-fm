import { type Metadata, PlaybackStatus } from "./mpris/dbus-types";
import { MprisPlayer } from "./mpris/player";
import { Emitter } from "./util";

interface PlayerScrobblerEvents {
    scrobble: (playerName: string, metadata: Metadata) => void;
}

enum EventType {
    Metadata = "metadata",
    PlaybackState = "state",
    Seek = "seek",
    SeekStart = "seekstart",
}

enum ScrobbleState {
    Idle = "idle",
    BeforeScrobble = "beforescrobble",
    AfterScrobble = "afterscrobble",
}

//note: times are in us, because... mpris?
const START_TRESHOLD = 10_000_000; // treat seeks up to 0:10 as restarting playback
const MIN_SCROBBLE = 30_000_000; // only scrobble after 30s
const DEFAULT_LENGTH = 2 * MIN_SCROBBLE; // 2x min so we can scrobble after 30s

export class PlayerScrobbler extends Emitter<PlayerScrobblerEvents> {
    protected scrobbleState = ScrobbleState.Idle;
    protected scrobbleTimeout?: NodeJS.Timeout;

    protected scrobble() {
        this.emit("scrobble", this.player.name, this.player.Metadata);
    }

    protected playerEvent(type: EventType, arg?: any) {
        console.log(`[${this.player.name}] ${type}`);
        switch (type) {
            case EventType.Metadata: {
                // i'm not sure if this needs to be handled
                this.setupScrobbleTimeout();
                break;
            }
            case EventType.SeekStart: {
                this.setupScrobbleTimeout();
                break;
            }
            case EventType.PlaybackState: {
                this.handlePlaybackState(
                    (arg as PlaybackStatus) ?? this.player.PlaybackStatus
                );
                break;
            }
        }
    }

    protected setupScrobbleTimeout() {
        if (this.scrobbleTimeout) clearTimeout(this.scrobbleTimeout);

        const trackLengthMs =
            (this.player.Metadata["mpris:length"] ?? DEFAULT_LENGTH) /
            (2 * 1000);
        const scrobbleIn = trackLengthMs - this.player.Position / 1000;
        if (scrobbleIn < 100) return;

        this.scrobbleTimeout = setTimeout(this.scrobble.bind(this), scrobbleIn);
        this.scrobbleState = ScrobbleState.BeforeScrobble;

        console.log(
            `${this.player.name} set to scrobble ${
                this.player.Metadata["xesam:title"]
            } in ${scrobbleIn / 1000}s`
        );
    }

    protected handlePlaybackState(state: PlaybackStatus) {
        switch (state) {
            case PlaybackStatus.Playing: {
                switch (this.scrobbleState) {
                    case ScrobbleState.BeforeScrobble:
                        //calculate scrobble time
                        this.setupScrobbleTimeout();
                        this.scrobbleState = ScrobbleState.BeforeScrobble;
                        break;
                    case ScrobbleState.AfterScrobble:
                        //no-op
                        break;
                    case ScrobbleState.Idle:
                        this.setupScrobbleTimeout();
                        break;
                }
                break;
            }
            case PlaybackStatus.Paused: {
                //playback paused; kill the timeout and handle the rest when we resume
                if (this.scrobbleTimeout) clearInterval(this.scrobbleTimeout);
                break;
            }
            case PlaybackStatus.Stopped: {
                //playback stopped; kill the timeout and forget about it
                if (this.scrobbleTimeout) clearInterval(this.scrobbleTimeout);
                this.scrobbleState = ScrobbleState.Idle;
                break;
            }
        }
    }

    protected checkScrobble() {}

    public constructor(protected player: MprisPlayer) {
        super();
        console.log(`Scrobbler for ${player.name} created`);
        this.player.on("metadatachange", () => {
            this.playerEvent(EventType.Metadata);
        });

        this.player.on("playbackstatechange", (newStatus) => {
            this.playerEvent(EventType.PlaybackState, newStatus);
        });

        this.player.on("seeked", (np, op) => {
            if (op > MIN_SCROBBLE && np < START_TRESHOLD)
                // might want to check if original pos was past the scrobble point
                return this.playerEvent(EventType.SeekStart);
            else this.playerEvent(EventType.Seek);
        });

        this.player.on("destroyed", () => {
            console.log(`${player.name} destroyed`);
            this.removeAllListeners();
        });
    }
}
