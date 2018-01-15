import { OrderedMap } from 'immutable';
import Service from './service'
import _ from 'lodash';

export default class Store {
    constructor(appComponent) {
        this.app = appComponent
        this.service = new Service();
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;

        this.token = this.getTokenFromLocalStorage();
        this.user = this.getUserFromLocalStorage();
        this.users = new OrderedMap();
        this.search = {
            users: new OrderedMap(),
        }
    }
    getTokenFromLocalStorage(){
        let token;
        const data = localStorage.getItem('token');
        if(data){
            try{
                token = JSON.parse(data);
            }catch(err){
                console.log(err);
            }
        }
        return token;
    }
    setUserToken(accessToken){
        if(!accessToken){
            //delete local token that saved last time 
            this.localStorage.removeItem('token');
            this.token = null;
        }
        this.token = accessToken;
        localStorage.setItem('token',JSON.stringify(accessToken))
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
                const userId = `${i}`;
                const member = this.users.get(userId)
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
        /* let searchItems = new OrderedMap(); */
        /* if (search.length) {
            //match search list
            users.forEach((user) => {
                const query = _.toLower(search)
                const name = _.toLower(_.get(user, 'name'))
                const userId = _.get(user, '_id')
                if (_.includes(name, query) && this.user._id !== userId) {
                    searchItems = searchItems.set(userId, user)
                }
            })
        } */
        return this.search.user.valueSeq();
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
        if(user){        
            localStorage.setItem('chatAppMe', JSON.stringify(user));
            //save this user to users collections in local
            const userId = `${_.get(user,'_id')}`;
            this.users = this.users.set(userId,user);
        }

    
        this.update();
    }
    getUserFromLocalStorage() {
        let user = null;
        const data = localStorage.getItem('chatAppMe')
        console.log('localData', data)
        if (data) {
            user = JSON.parse(data)
        }
        return user
    }
    login(email = null, password = null) {
        const userEmail = _.toLower(email)


        const user = {
            email: userEmail,
            password,
        }
        console.log("Trying to login with user info", user);
        return new Promise((resolve, reject) => {
            //call backend service and login with user data
            this.service.post('api/users/login', user).then((res) => {
                //successful user logged in 
                const accessToken = _.get(res,'data');
                const user = _.get(accessToken,'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);

                console.log('Got user login callback from the server',accessToken);

            }).catch((err) => {
                console.log("Got an error login from server",err)
                //err.response.data.err.message
                const message = _.get(err, 'response.data.err.message', 'Login error')
                return reject(message)
            })
        });


        // return new Promise((resolve, reject) => {
        //     const user = users.find((user) => _.get(user, 'email') === userEmail)

        //     /*             if (user) {
        //                     _this.setCurrentUser(user)
        //                 } */
        //     try {
        //         _this.setCurrentUser(user)
        //     } catch (err) {
        //         console.log(err)
        //     }
        //     console.log('email: ', email, 'password: ', password, 'user: ', user)
        //     return user ? resolve(user) : reject('user not found')
        //         /*     if (user) {
        //                 return resolve(user)
        //             } else {
        //                 return reject('user not found')
        //             } */
        // })
    }
    signOut() {
        this.user = null;
        localStorage.removeItem('chatAppMe')
        this.update();
    }
}