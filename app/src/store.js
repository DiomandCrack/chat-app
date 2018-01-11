import { OrderedMap } from 'immutable';
import _ from 'lodash';

const users = OrderedMap({
    '1': { _id: '1', email: 'zk05161219@gmail.com', name: 'Diamond', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@1.png' },
    '2': { _id: '2', email: 'abc@gmail.com', name: 'abc', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@2.png' },
    '3': { _id: '3', email: 'k@gmail.com', name: 'K', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@3.png' }
})

export default class Store {
    constructor(appComponent) {
        this.app = appComponent
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;

        this.user = {
            _id: '1',
            name: 'Diamond',
            avatar: 'https://api.adorable.io/avatars/100/abott@1.png',
            created: new Date(),
        }
        this.user = this.getUserFromLocalStorage();
    }
    getCurrentUser() {
        return this.user
    }
    getActiveChannel() {
        return this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
    }

    getMembersFromChannel(channel) {
        let members = new OrderedMap();
        if (channel) {
            channel.members.forEach((item, i) => {
                const member = users.get(i)
                if (this.user._id !== member._id) {
                    members = members.set(i, member)
                }
            })
        }
        return members.valueSeq()
    }

    onCreateNewChannel(channel = {}) {
        console.log(channel);
        const channelId = _.get(channel, '_id')
        this.addChannel(channelId, channel)
        console.log(JSON.stringify(this.channels.toJS()))
    }

    setActiveChannelId(id) {
        this.activeChannelId = id;
        this.update();
    }
    getMessagesFromChannel(channel) {
        let messages = new OrderedMap();

        if (channel) {
            channel.messages.forEach((item, i) => {
                const message = this.messages.get(i);
                messages = messages.set(i, message)
            })
        }
        return messages.valueSeq()
    }

    addMessage(id, message = {}) {
        //add user object
        const user = this.getCurrentUser();
        message.user = user
        this.messages = this.messages.set(id, message);
        //add new message id to channel
        const channelId = _.get(message, 'channelId');
        if (channelId) {
            let channel = this.channels.get(channelId);

            channel.isNew = false;
            channel.lastMessage = _.get(message, 'main', '')

            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel)
        }
        this.update();
        // console.log(JSON.stringify(this.messages.toJS()))
    }

    addChannel(index, channel = {}) {
        this.channels = this.channels.set(`${index}`, channel)
        this.update();
    }
    addUserToChannel(channelId, userId) {
        console.log(channelId, userId);
        const channel = this.channels.get(channelId);
        if (channel) {
            //add this member to channel
            channel.members = channel.members.set(userId, true)
            this.channels = this.channels.set(channelId, channel)
            this.update();
        }
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
            users.forEach((user) => {
                const query = _.toLower(search)
                const name = _.toLower(_.get(user, 'name'))
                const userId = _.get(user, '_id')
                if (_.includes(name, query) && this.user._id !== userId) {
                    searchItems = searchItems.set(userId, user)
                }
            })
        }
        return searchItems.valueSeq();
    }
    removeMemberFromChannel(channel = null, user = null) {
            if (!channel || !user) {
                return;
            }
            const userId = _.get(user, '_id')
            const channelId = _.get(channel, '_id')
            channel.members = channel.members.remove(userId)
            this.channels = this.channels.set(channelId, channel)
            this.update()
        }
    //login/logout-------------------------------------------
    setCurrentUser(user) {
        this.user = user;
        localStorage.setItem('chatAppMe',JSON.stringify(user))
        this.update();
    }
    getUserFromLocalStorage(){
        let user=null;
        const data = localStorage.getItem('chatAppMe')
        console.log('localData',data)
        try{
            user = JSON.parse(data)
        }catch(err){
            console.log(err)
        }
        return user
    }
    login(email, password) {
        const userEmail = _.toLower(email)
        const _this = this
        return new Promise((resolve, reject) => {
            const user = users.find((user) => _.get(user, 'email') === userEmail)

            if (user) {
                _this.setCurrentUser(user)
            }
            console.log('email: ', email, 'password: ', password, 'user: ', user)
            return user ? resolve(user) : reject('user not found')
                /*     if (user) {
                        return resolve(user)
                    } else {
                        return reject('user not found')
                    } */
        })

    }
}