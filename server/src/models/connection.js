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
    sendToMembers(userId, obj) {
        const query = [{
                $match: {
                    members: {
                        $all: [new ObjectID(userId)]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members',
                    foreginField: '_id',
                    as: 'users'
                }
            },
            {
                $unwind: {
                    path: '$users',
                }
            },
            {
                $match: {
                    'users.online': { $eq: true }
                },
            },
            {
                $group: {
                    _id: '$users._id'
                }
            }
        ];
        const users = [];
        this.app.db.collection('channels').aggregate(query, (err, members) => {
            if (err === null && members) {
                _.each(members, (member) => {
                    const userId = _.toString(_.get(member, '_id'));
                    if (userId) {
                        users.push(userId);
                    }
                });
                //this is list of all connections is chatting with current user
                const memberConnections = this.connections.filter((connection) => _.includes(users, _.toString(_.get(connection, 'userId'))));
                if (memberConnections.size) {
                    memberConnections.forEach((connection, key) => {

                        const ws = connection.ws;
                        this.send(ws, obj);
                    });
                }
            }
        });
    }
    work(socketId, msg) {
        const action = _.get(msg, 'action');
        const payload = _.get(msg, 'payload');
        const userConnection = this.connections.get(socketId);
        switch (action) {
            case 'create_message':
                {
                    if (userConnection.isAuthenticated) {
                        let messageObject = payload;
                        messageObject.userId = _.get(userConnection, 'userId');
                        this.app.models.message.create(messageObject).then((message) => {
                            //message created successfully
                            console.log('Message Created', message);
                            const channelId = _.toString(_.get(message, 'channelId'));
                            this.app.models.channel.load(channelId).then((channel) => {
                                // console.log('got chnanel of the message created', channel);
                                const memberIds = _.get(channel, 'members', []);
                                _.each(memberIds, (memberId) => {
                                    memberId = _.toString(memberId);
                                    const memberConnection = this.connections.filter((channel) => _.toString(channel.userId));
                                    memberConnection.forEach((connection) => {

                                        const ws = connection.ws;

                                        this.send(ws, {
                                            action: 'message_added',
                                            payload: message,
                                        })

                                    });
                                });
                            });

                        }).catch(err => {
                            //send back to the sokect client who sent this message with err
                            const ws = userConnection.ws;
                            this.send(ws, {
                                action: 'create_message_error',
                                payload,
                            });
                        })
                    }

                    break;
                }
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
                        const memberIds = _.get(channelObject, 'members', []);
                        //fetch all users has memberIds
                        const query = {
                            _id: {
                                $in: memberIds
                            }
                        }
                        const queryOptions = {
                            _id: true,
                            name: true,
                            created: true,
                        }
                        this.app.models.user.find(query, queryOptions).then((users) => {
                            channelObject.users = users;

                            _.each(memberIds, (id) => {
                                const userId = id.toString();
                                const memberConnection = this.connections.filter((connection) => {
                                    return `${connection.userId}` === userId;
                                });
                                if (memberConnection.size) {
                                    memberConnection.forEach((connection) => {
                                        const ws = connection.ws;
                                        const obj = {
                                            action: 'channel_added',
                                            payload: channelObject,
                                        };
                                        //send to socket client matching userId in channel members
                                        this.send(ws, obj);
                                    })
                                }
                            })
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

                            //send to all socket clients connection
                            const userIdString = _.toString(userId);
                            this.sendToMembers(userIdString, {
                                action: 'user_online',
                                payload: userIdString
                            });
                            this.app.models.user.updateUserStatus(userIdString, true);

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
    sendAll(obj) {
        //send socket messages to all clients.

        this.connections.forEach((connection, key) => {
            const ws = connection.ws;
            this.send(ws, obj);
        });
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

                ws.send('the ID:' + socketId);
                const message = this.decodeMessage(msg);
                this.work(socketId, message);
                console.log("SERVER:message from a client", message);
            })
            console.log('SomeOne connected ', socketId);
            ws.on('close', () => {
                // console.log('someone disconnected to the server', sokectId)
                //remove this socket from cache connection
                const closeConnection = this.connections.get(socketId);
                const userId = _.get(closeConnection, 'userId', null);
                this.connections = this.connections.remove(socketId);

                if (userId) {
                    //now find all socket clients matching with userId
                    const userConnections = this.connections.filter((connection) => _.toString(_.get(connection, 'userId')) === userId);
                    //no more socket clients is online with this userId. now user is offline
                    if (userConnections.size === 0) {
                        this.sendToMembers(userId, {
                            action: 'user_offline',
                            payload: `${userId}`
                        });
                        //update user status into database
                        this.app.models.user.updateUserStatus(`${userId}`, false);
                    }


                }
            })
        });
    }
}

module.exports = Connection;