const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
class Connection {
    constructor(app) {
        this.app = app;
        this.connection = new OrderedMap();
        this.modelDidload();
    }
    modelDidload() {

        this.app.wss.on('connection', (ws) => {
            const sokectId = new ObjectID().toString();
            ws.on('message', (msg) => {
                console.log("SERVER:message from a client", msg);
            })
            console.log('SomeOne connected ', sokectId);
            ws.on('close', () => {
                console.log('someone disconnected to the server', sokectId)
            })
        });
    }
}

module.exports = Connection;