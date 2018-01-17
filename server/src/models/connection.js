const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
class Connection {
    constructor(app) {
        this.app = app;
        this.connection = new OrderedMap();
        this.modelDidload();
    }
    work(msg) {
        const action = _.get(msg, 'action');
        const payload = _.get(msg, 'payload');
        switch (action) {
            case 'auth':
                {
                    const userTokenId = payload;
                    console.log("user with token ID is:", userTokenId, typeof userTokenId);
                    break;
                }
            default:
                break;
        }

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
                this.work(message);
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