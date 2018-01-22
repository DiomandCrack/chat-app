import _ from 'lodash';
import { OrderedMap } from 'immutable';

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
        if (tokenId) {
            this.send(message);
        }

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
            case 'message_added':
                {
                    const user = _.get(payload, 'user');
                    //add user to cache
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
                    console.log('messageObject', messageObject);
                    store.setMessageToCache(messageObject);

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
            created: Date.now(),
            userId,
            isNew: false,
        };
        _.each(users, (user) => {
            //and this user to store.users collection
            const memberId = `${user._id}`;
            store.addUserToCache(user);
            channel.members = channel.members.set(memberId, true);
        })
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
        console.log('begin connection to server');
        const ws = new WebSocket('ws://localhost:3001');
        this.ws = ws
        this.ws.onopen = () => {
            console.log('You are connection');
            //tell server who I am；
            this.isConnected = true;
            this.authentication();
            ws.onmessage = (e) => {
                this.readMessage(_.get(e, 'data', {}));
                console.log("message from server", e.data);
            }
        }
        this.ws.onclose = () => {
            console.log('You disconnected');
            this.isConnected = false;
        }
    }
}