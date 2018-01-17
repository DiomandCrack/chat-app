const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
class Connection {
    constructor(app) {
        this.app = app;
        this.connection = new OrderedMap();
        this.modelDidload();
    }
    decodeMessage(msg) {
        let messageObject = null;
        try {
            messageObject = JSON.parse(msg);
            return messageObject
        } catch (err) {
            console.log('An error decode the socket message', msg)
        }
        return messageObject;
    }

    modelDidload() {

        this.app.wss.on('connection', (ws) => {
            const sokectId = new ObjectID().toString();
            ws.on('message', (msg) => {

                const message = this.decodeMessage(msg);
                console.log("SERVER:message from a client", message);
            })
            console.log('SomeOne connected ', sokectId);
            ws.on('close', () => {
                // console.log('someone disconnected to the server', sokectId)
            })
        });
    }
}

module.exports = Connection;