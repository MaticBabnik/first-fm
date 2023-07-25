import { app } from "electron";
import FirstFM from "./App";

const firstfm = new FirstFM(app);

// const createWindow = () => {
//     const tray = new Tray()

//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             preload: path.join(__dirname, "preload.js"),
//         },
//     });

//     if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//         mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//     } else {
//         mainWindow.loadFile(
//             path.join(
//                 __dirname,
//                 `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
//             )
//         );
//     }

//     mainWindow.webContents.openDevTools();
// };

// app.on("ready", createWindow);

// app.on("window-all-closed", () => {
//     if (process.platform !== "darwin") {
//         app.quit();
//     }
// });

// app.on("activate", () => {
//     // On OS X it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });
