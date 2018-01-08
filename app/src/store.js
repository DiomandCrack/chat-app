import { OrderedMap } from 'immutable';
import escapeRegExp from 'escape-string-regexp';
import _ from 'lodash';

const users = OrderedMap({
    '1': { _id: '1', name: 'Diamond', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@1.png' },
    '2': { _id: '2', name: 'abc', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@2.png' },
    '3': { _id: '3', name: 'K', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@3.png' }
})

export default class Store {
    constructor(appComponent) {
        this.app = appComponent
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;

        this.user = {
            _id: 0,
            name: '我',
            created: new Date(),
        }
    }
    getCurrentUser() {
        return this.user
    }
    getActiveChannel() {
        return this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
    }

    getMembersFromChannel(channel) {
        const members = [];
        if (channel) {
            channel.members.map((item, i) => {
                const member = users.get(i)
                members.push(member)
            })
        }
        return members
    }

    onCreateNewChannel(channel = {}) {
        console.log(channel);
        const channelId = _.get(channel, '_id')
        this.addChannel(channelId, channel)
    }

    setActiveChannelId(id) {
        this.activeChannelId = id;
        this.update();
    }
    getMessagesFromChannel(channel) {
        let messages = [];

        if (channel) {
            channel.messages.map((item, i) => {
                const message = this.messages.get(i);
                messages.push(message)
            })
        }
        return messages
    }

    addMessage(id, message = {}) {
        this.messages = this.messages.set(`${id}`, message);
        //add new message id to channel
        const channelId = _.get(message, 'channelId');
        if (channelId) {
            const channel = this.channels.get(channelId);
            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel)
        }
        this.update();
    }

    addChannel(index, channel = {}) {
        this.channels = this.channels.set(`${index}`, channel)
        this.update();
    }

    getMessages() {
        return this.messages.valueSeq();
    }

    getChannels() {

        // need sort channels by created
        this.channels = this.channels.sort((a, b) => b.created - a.created)
        return this.channels.valueSeq();
    }

    update() {
        this.app.forceUpdate();
    }

    searchUsers(search = '') {
        let searchItems = new OrderedMap();
        if (search.length) {
            //match search list
            users.filter((user) => {
                const name = _.get(user, 'name')
                const userId = _.get(user, '_id')
                if (_.includes(name, search)) {
                    searchItems = searchItems.set(userId, user)
                }
            })
        }
        return searchItems.valueSeq();
    }
}