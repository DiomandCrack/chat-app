import _ from 'lodash';
import { OrderedMap } from 'immutable';

export default class RealTime {
    constructor(store) {
        this.store = store;
        this.ws = null;
        this.isConnected = false;

        this.connect();
        this.reconnect();
    }
    authentication() {
        const store = this.store;
        const tokenId = store.getUserToken();
        const message = {
            action: 'auth',
            payload: `${tokenId}`,
        };
        if (tokenId) {
            this.send(message);
        }

    }
    reconnect() {
        const store = this.store;
        window.setInterval(() => {
            const user = store.getCurrentUser();
            if (user && !this.isConnected) {
                this.connect();
            }
        }, 3000);

    }
    decodeMessage(msg) {
        let message = {};
        try {
            message = JSON.parse(msg);
        } catch (err) {
            console.log(err)
        }
        return message;
    }
    readMessage(msg) {
        const store = this.store;
        const currentUser = store.getCurrentUser();
        const currentUserId = _.toString(_.get(currentUser, '_id'));
        const message = this.decodeMessage(msg);
        const action = _.get(message, 'action', '');
        const payload = _.get(message, 'payload');
        switch (action) {
            case 'user_offline':
                {
                    this.onUpdateUserStatus(payload, false);
                    break;
                }
            case 'user_online':
                {
                    const isOnline = true;
                    this.onUpdateUserStatus(payload, isOnline);
                    break;
                }
            case 'message_added':
                {
                    const activeChannel = store.getActiveChannel();
                    let notify = _.get(activeChannel, '_id') !== _.get(payload, 'channelId') && currentUserId !== _.get(payload, 'userId');
                    this.onAddMessage(payload, notify);
                    break;
                }
            case 'channel_added':
                {
                    this.onAddChannel(payload);
                    break;
                }
            default:
                break;
        }
    }
    onUpdateUserStatus(userId, isOnline = false) {
        const store = this.store;
        // user.online = isOnline;
        // this.users = this.users.get(userId, user);
        store.users = store.users.update(userId, (user) => {
            if (user) {
                user.online = isOnline;
            }

            return user;
        });
        store.update();
    };
    onAddMessage(payload, notify = false) {
        const user = _.get(payload, 'user');
        //add user to cache
        const store = this.store;
        const currentUser = store.getCurrentUser();
        const currentUserId = _.toString(_.get(currentUser, '_id'));
        store.addUserToCache(user);

        const messageObject = {
            _id: _.get(payload, '_id'),
            main: _.get(payload, 'main', ''),
            userId: _.get(payload, 'userId'),
            channelId: _.get(payload, 'channelId'),
            created: _.get(payload, 'created', new Date()),
            me: currentUserId === _.toString(_.get(payload, 'userId')),
            user,
        };
        // console.log('messageObject', messageObject);
        store.setMessageToCache(messageObject, notify);
    }
    onAddChannel(payload) {

        //to do check payload
        const store = this.store;
        const channelId = `${payload._id}`;
        const userId = `${payload.userId}`;
        const users = _.get(payload, 'users', []);
        const channel = {
            _id: `${channelId}`,
            title: _.get(payload, 'title', ''),
            lastMessage: _.get(payload, 'lastMessage'),
            members: new OrderedMap(),
            messages: new OrderedMap(),
            created: new Date(),
            userId,
            isNew: false,
        };
        _.each(users, (user) => {
            //and this user to store.users collection
            const memberId = `${user._id}`;
            store.addUserToCache(user);
            channel.members = channel.members.set(memberId, true);
        });
        const channelMessages = store.messages.filter((member) => {
            return _.toString(member.channelId) === channelId;
        });

        channelMessages.forEach((msg) => {
            const msgId = _.toString(_.get(msg, '_id'));
            channel.messages = channel.messages.set(msgId, true);
        });
        store.addChannel(channelId, channel);
    }
    send(message = {}) {
        const isConnected = this.isConnected;
        if (isConnected) {
            const msgString = JSON.stringify(message);
            this.ws.send(msgString);
        }
    }
    connect() {
        // console.log('begin connection to server');
        const ws = new WebSocket('ws://localhost:3001');
        this.ws = ws
        this.ws.onopen = () => {
            // console.log('You are connection');
            //tell server who I am；
            this.isConnected = true;
            this.authentication();
            ws.onmessage = (e) => {
                this.readMessage(_.get(e, 'data', {}));
                console.log("message from server", e.data);
            }
        }
        this.ws.onclose = () => {
            // console.log('You disconnected');
            this.isConnected = false;
            this.store.update();

        }
        this.ws.onerror = () => {
            this.isConnected = false;
            this.store.update();
        }
    }
}