const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
class Connection {
    constructor(app) {
        this.app = app;
        this.connections = new OrderedMap();

        this.modelDidload();
    }
    send(ws, obj) {
        const message = JSON.stringify(obj);
        ws.send(message);
    }
    work(socketId, msg) {
        const action = _.get(msg, 'action');
        const payload = _.get(msg, 'payload');
        switch (action) {
            case 'create_channel':
                {
                    console.log('channel created from client', channel);
                    const channel = payload;
                    const connection = this.connections.get(socketId);
                    const userId = connection.userId;

                    channel.userId = userId;

                    this.app.models.channel.create(channel).then((channelObject) => {
                        //successful created channel
                        console.log('successful create new channel', channelObject);
                        //send backend to all members in this channel with new channel created
                        let memberConnections = [];
                        _.each(_.get(channelObject, 'members', []), (id) => {
                            const userId = id.toString();
                            const memberConnection = this.connections.filter((connection) => {
                                return `${connection.userId}` === userId
                            });
                            if (memberConnection.size) {
                                memberConnection.forEach((connection) => {
                                    const ws = connection.ws;
                                    const obj = {
                                            action: 'channel_added',
                                            payload: channelObject,
                                        }
                                        //send to socket
                                    this.send(ws, obj);
                                })

                            }

                        });
                    }).catch(err => {
                        console.log(err);
                    });

                    break;
                }

            case 'auth':
                {
                    const userTokenId = payload;
                    const connection = this.connections.get(socketId);
                    if (connection) {
                        this.app.models.token.loadTokenAndUser(userTokenId).then((token) => {
                            const userId = token.userId;
                            connection.isAuthenticated = true;
                            connection.userId = `${userId}`;

                            this.connections = this.connections.set(socketId, connection);
                            const obj = {
                                action: 'auth_success',
                                payload: 'verified',
                            }
                            this.send(connection.ws, obj);
                        }).catch(err => {
                            //send back to socket client not loggin
                            const obj = {
                                action: 'auth_err',
                                payload: 'An error authentication your account ',
                            };
                            this.send(connection.ws, obj);
                        });

                    }

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
            const socketId = new ObjectID().toString();
            const clientConnection = {
                _id: `${socketId}`,
                ws,
                userId: null,
                isAuthenticated: false,
            };
            //save this connection into cache
            this.connections = this.connections.set(socketId, clientConnection);
            ws.on('message', (msg) => {

                ws.send('the ID:' + socketId)
                const message = this.decodeMessage(msg);
                this.work(socketId, message);
                console.log("SERVER:message from a client", message);
            })
            console.log('SomeOne connected ', socketId);
            ws.on('close', () => {
                // console.log('someone disconnected to the server', sokectId)
                //remove this socket from cache connection
                this.connections = this.connections.remove(socketId);
            })
        });
    }
}

module.exports = Connection;