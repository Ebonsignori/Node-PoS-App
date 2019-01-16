// ============================================
// Websocket config
// ============================================
export let SERVER_URL;
if (process.env.NODE_ENV === "development") {
    SERVER_URL = "http://localhost:3000";
} else {
    SERVER_URL = "http://157.230.152.107:3000";
}

export const WEBSOCKET_TIMEOUT = 10000;
