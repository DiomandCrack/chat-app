import { OrderedMap } from 'immutable';
import Service from './service'
import _ from 'lodash';
import RealTime from './realtime'

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
        this.realTime = new RealTime(this);
        this.fetchUserChannels();
    }
    fetchUserChannels() {
        const userToken = this.getUserToken();

        if (userToken) {
            const options = {
                headers: {
                    authorization: userToken,
                }
            }
            this.service.get('api/me/channels', options).then(response => {
                const channels = response.data;
                _.each(channels, (channel) => {
                    this.realTime.onAddChannel(channel);
                });

                const firstChannel = _.get(channels, '[0]._id', null);
                this.fetchChannelMessages(firstChannel);

            }).catch(err => {
                console.log('An err fetching user channels', err);
            });
        }
    }
    getTokenFromLocalStorage() {
        if (this.token) {
            return this.token;
        }
        let token = null;
        const data = localStorage.getItem('token');
        if (data) {
            try {
                token = JSON.parse(data);
            } catch (err) {
                console.log(err);
            }
        }
        return token;
    }
    getUserToken() {
        const tokenId = _.get(this.token, '_id', null);
        return tokenId;
    }
    setUserToken(accessToken) {
        if (!accessToken) {
            //delete local token that saved last time 
            this.localStorage.removeItem('token');
            this.token = null;
            return;
        }
        this.token = accessToken;
        localStorage.setItem('token', JSON.stringify(accessToken))
    }

    addUserToCache(user) {
        user.avatar = this.loadUserAvatar(user);
        const id = `${user._id}`;
        this.users = this.users.set(id, user);

        this.update();
    }

    getUserFromLocalStorage() {
        let user = null;
        const data = localStorage.getItem('chatAppMe')
            // console.log('localData', data)
        try {
            user = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
        if (user) {
            //try to connect to backend server and verify this user is exist.
            const token = this.getTokenFromLocalStorage();
            const tokenId = _.get(token, '_id');
            const options = {
                headers: {
                    authorization: tokenId,
                }
            }
            this.service.get('api/users/me', options).then((res) => {
                // this mean user is logged with this token id
                const accessToken = res.data;
                const user = _.get(accessToken, 'user')
                this.setCurrentUser(user);
                this.setUserToken(accessToken);
            }).catch((err) => {
                console.log(err);
                this.signOut()
            })
        }
        return user
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
                const member = this.users.get(userId);
                const loggedUser = this.getCurrentUser();
                if (_.get(loggedUser, '_id') !== _.get(member, '_id')) {
                    members = members.set(i, member);
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

        this.fetchChannelMessages(id);

        this.update();
    }
    isConnected() {
        return this.realTime.isConnected;
    }
    fetchChannelMessages(channelId) {
        let channel = this.channels.get(channelId);
        if (channel && !_.get(channel, 'isFetchedMessages')) {
            const token = _.get(this.token, '_id');
            const options = {
                headers: {
                    authorization: token,
                }
            }
            this.service.get(`api/channels/${channelId}/messages`, options).then((response) => {
                channel.isFetchedMessages = true;
                const messages = response.data;
                _.each(messages, (message) => {
                    this.realTime.onAddMessage(message);
                });
                this.channels = this.channels.set(channelId, channel);
            }).catch((err) => {
                console.log('fetchChannelMessage', err);
            });
        }
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
    setMessageToCache(message, notify = false) {
        const id = _.toString(_.get(message, '_id'));
        this.messages = this.messages.set(id, message);
        const channelId = _.toString(_.get(message, 'channelId'));
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.messages = channel.messages.set(id, true);
            channel.lastMessage = _.get(message, 'main', '');
            channel.notify = notify;
            this.channels = this.channels.set(channelId, channel);
        } else {
            //fetch to the server with channel info
            this.service.get(`api/channels/${channelId}`).then((response) => {
                const channel = _.get(response, 'data');
                // const users = _.get(channel, 'users');
                // this.channels = this.channels.set(channelId, channel);
                // _.each(users, (user) => {
                //     this.addUserToCache(user);
                // });
                this.realTime.onAddChannel(channel);
            });
        }
        this.update();
    }
    addMessage(id, message = {}) {
        //add user object
        const user = this.getCurrentUser();
        if (user) {
            message.user = user;
            message.user.avatar = this.loadUserAvatar(user);
        }
        this.messages = this.messages.set(id, message);
        //add new message id to channel
        const channelId = _.get(message, 'channelId');
        if (channelId) {
            let channel = this.channels.get(channelId);


            channel.lastMessage = _.get(message, 'main', '')

            //send channel info to server
            const obj = {
                action: 'create_channel',
                payload: channel,
            }
            this.realTime.send(obj);

            //send to the server via websocket to create new message and notify to other members;
            this.realTime.send({
                action: 'create_message',
                payload: message,
            });

            console.log('Channel', channel);

            channel.messages = channel.messages.set(id, true);

            channel.isNew = false;
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
        this.channels = this.channels.sort((a, b) => a.updated - b.updated);
        return this.channels.valueSeq();
    }

    update() {
        this.app.forceUpdate();
    }
    loadUserAvatar(user) {
        if (user) {
            return `https://api.adorable.io/avatars/100/${user._id}.png`;
        }
    }
    startSearchUsersFromServer(q = '') {
        //query to backend server and get list of users;
        const data = { search: q };
        this.search.users = this.search.users.clear();
        this.service.post('api/users/search', data).then((res) => {
            const users = _.get(res, 'data', []);
            _.each(users, (user) => {
                //cache to this.users;
                //add user to this.search.users;
                const userId = `${_.get(user,'_id')}`;

                user.avatar = this.loadUserAvatar(user);
                this.users = this.users.set(userId, user);
                this.search.users = this.search.users.set(userId, user);

            });
            // console.log("Get list of users from server", users);
            this.update();
        }).catch((err) => {

            console.log("user not found");
        });
    }

    getSearchUsers() {
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

        return this.search.users.valueSeq();
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
        user.avatar = `https://api.adorable.io/avatars/100/${user._id}.png`;

        if (user) {
            localStorage.setItem('chatAppMe', JSON.stringify(user));
            //save this user to users collections in local
            const userId = `${_.get(user,'_id')}`;
            this.users = this.users.set(userId, user);
        }


        this.update();
    }
    register(user) {
        return new Promise((resolve, reject) => {
            this.service.post('api/users', user).then((res) => {
                console.log('user created', res.data);
                return resolve(res.data);
            }).catch(err => reject({ message: 'An err create your account' }));
        });
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
                const accessToken = _.get(res, 'data');
                const user = _.get(accessToken, 'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);
                //call to realtime and connect again to sokect serer with this user
                this.realTime.connect();
                //fecthing user channel

                // console.log('Got user login callback from the server', accessToken);
                this.fetchUserChannels();

            }).catch((err) => {
                console.log("Got an error login from server", err)
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

    clearCacheData() {
        this.channels = this.channels.clear();
        this.messages = this.messages.clear();
        this.users = this.users.clear();
    }

    signOut() {
        const userId = `${_.get(this.user,'_id',null)}`;
        //request to backend and logout this user
        const tokenId = _.get(this.token, '_id', null);
        const options = {
            headers: {
                authrization: tokenId,
            }
        };
        this.service.get('api/me/logout', options);
        this.user = null;
        localStorage.removeItem('chatAppMe');
        localStorage.removeItem('token');
        this.clearCacheData();
        if (userId) {
            this.users = this.users.remove(userId);
        }

        this.update();
    }

}