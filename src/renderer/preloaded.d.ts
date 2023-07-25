import { ElectronApi } from "../API.ts";

declare global {
    interface Window {
        API: ElectronApi;
    }
}
export {};
