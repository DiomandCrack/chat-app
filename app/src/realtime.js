export default class RealTime {
    constructor(store) {
        this.store = store;
        this.ws = null;
        this.isConnected = false;

        this.connect();
    }
    authentication() {
        const store = this.store;
        const tokenId = store.getUserToken();
        const message = {
            action: 'auth',
            payload: `${tokenId}`,
        };
        this.send(message);

    }
    send(message = {}) {
        const isConnected = this.isConnected;
        if (isConnected) {
            const msgString = JSON.stringify(message);
            this.ws.send(msgString);
        }
    }
    connect() {
        console.log('begin connection to server');
        this.ws = new WebSocket('ws://localhost:3001');
        this.ws.onopen = () => {
            console.log('You are connection');
            //tell server who I am；
            this.isConnected = true;
            this.authentication();
        }
        this.ws.onclose = () => {
            console.log('You disconnected');
            this.isConnected = false;
        }
    }
}