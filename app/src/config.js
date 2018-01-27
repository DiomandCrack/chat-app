const production = true;
const domain = production ? `188.166.191.232` : `127.0.0.1:3001`;
export const WebSocketUrl = `ws://${domain}`;
export const apiUrl = `http://${domain}`;