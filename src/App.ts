import { BrowserWindow, Menu, Tray, nativeImage } from "electron";
import { Mpris } from "./players";
import { PlaybackStatus } from "./players/mpris/dbus-types";
import { join } from "path";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;

const playerAllowList = [/spotify/, /clementine/];

// Mpris.create().then((mpris) => {
//     mpris.on("playeradded", (player) => {
//         if (!playerAllowList.find((x) => x.test(player.name))) return;

//         const s = new PlayerScrobbler(player);

//         s.on("scrobble", (playerName, metadata) => {
//             console.log(`${playerName} scrobbled ${metadata["xesam:title"]}`);
//         });
//     });
// });

export default class FirstFM {
    protected window: Electron.BrowserWindow | null = null;
    protected tray: Electron.Tray | null = null;
    protected mpris: Mpris | null = null;

    private canQuit = false;

    public constructor(protected app: Electron.App) {
        Mpris.create().then((mpris) => {
            this.mpris = mpris;
            setInterval(() => {
                const active = [...mpris.players.values()].find(
                    (x) => x.PlaybackStatus === PlaybackStatus.Playing
                );

                if (!active) {
                    return this.window?.webContents.send("mpris-status", null);
                }

                this.window?.webContents.send("mpris-status", {
                    metadata: active.Metadata,
                    progress: active.Position,
                });
            }, 1000);
        });

        app.on("ready", this.ready.bind(this));

        app.on("before-quit", () => {
            this.canQuit = true;
        });
    }

    private ready() {
        const image = nativeImage.createFromPath("assets/icon32.png");
        this.tray = new Tray(image);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Open",
                type: "normal",
                click: this.toggleWindow.bind(this),
            },
            { type: "separator" },
            { label: "Quit", type: "normal", click: this.exit.bind(this) },
        ]);

        this.tray.setContextMenu(contextMenu);
        this.tray.setTitle("FirstFM");
        this.tray.setToolTip("FirstFM");

        this.tray.on("click", this.toggleWindow.bind(this));

        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            icon: image,
            title: "FirstFM",
            autoHideMenuBar: true,
            webPreferences: {
                devTools: true,
                preload: join(__dirname, "preload.js"),
            },
        });

        this.window;

        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        } else {
            this.window.loadFile("dist/renderer/index.html");
        }

        this.window.on("minimize", () => {
            this.window?.hide();
        });

        this.window.on("close", (e) => {
            console.log("close");
            if (!this.canQuit) e.preventDefault();
            this.window?.hide();
        });
    }

    public toggleWindow() {
        if (this.window?.isVisible()) {
            this.window.hide();
        } else {
            this.window?.show();
        }
    }

    public exit() {
        this.canQuit = true;
        this.app.quit();
    }
}
