const moment = require('moment');
const _ = require('lodash');
const START_TIME = new Date();
class AppRouter {
    constructor(app) {
        this.app = app;
        this.setupRouter = this.setupRouter.bind(this)
        this.setupRouter();
    }


    setupRouter() {
        const app = this.app;
        console.log("APP Router works");

        /*
        @endpoint:/
        @method:GET
        */
        // app.get('/', (req, res, next) => {
        //     return res.json({ time: moment(START_TIME).fromNow() })
        // });
        /*
        @endpoint: /
        @method: POST
        */
        app.post('/api/users', (req, res, next) => {
            const body = req.body;
            app.models.user.create(body).then((user) => {
                _.unset(user, 'password');
                return res.status(200).json(user);
            }).catch((err) => {
                return res.status(503).json({
                    err
                })
            });

        });
        /*
        @endpoint:/api/users/me
        @method:GET 
        */
        app.get('/api/users/me', (req, res, next) => {
            let tokenId = req.get('authorization');
            if (!tokenId) {
                //get token from query
                tokenId = _.get(req, 'query.auth');
            }
            // console.log(tokenId);
            app.models.token.loadTokenAndUser(tokenId).then((accessToken) => {
                _.unset(accessToken, 'user.password')
                return res.json(accessToken);
            }).catch((err) => {
                return res.status(401).json({
                    err
                })
            });
        });
        /*
        @endpoint: /api/me/logout
        @method:GET
        */
        app.get('/api/me/logout', (req, res, next) => {
            let tokenId = req.get('authorization');
            if (!tokenId) {
                //get token from query
                tokenId = _.get(req, 'query.auth');
            }
            app.models.token.loadTokenAndUser(tokenId).then((token) => {
                app.models.token.logout(token);
                return res.status(200).json({
                    message: 'Successsful'
                });
            }).catch(err => {
                return res.status(401).json({ err: { message: 'Access denied' } })
            });
        });
        /*
        @endpoint: /api/me/channels
        @method:GET
        */
        app.get('/api/me/channels', (req, res, next) => {
            let tokenId = req.get('authorization');
            if (!tokenId) {
                //get token from query
                tokenId = _.get(req, 'query.auth');
            }
            // console.log(tokenId);
            app.models.token.loadTokenAndUser(tokenId).then((accessToken) => {

                const userId = accessToken.userId;
                //
                const query = [{
                        $lookup: {
                            from: 'users',
                            localField: 'members',
                            foreignField: '_id',
                            as: 'users',
                        },
                    },
                    {
                        $match: {
                            members: { $all: [userId] }
                        }
                    },
                    {
                        $project: {
                            _id: true,
                            title: true,
                            lastMessage: true,
                            created: true,
                            updated: true,
                            members: true,
                            users: {
                                _id: true,
                                name: true,
                                created: true,
                                online: true,
                            },
                        }
                    },
                    {
                        $sort: {
                            update: -1,
                            created: -1,
                        }
                    },
                    {
                        $limit: 50,
                    }
                ];

                app.models.channel.aggregate(query).then((channels) => {
                    return res.status(200).json(channels);
                }).catch((err) => {
                    return res.status(404).json({ error: { message: 'not found' } })
                });

            }).catch((err) => {
                return res.status(401).json({
                    err: {
                        message: 'access denity'
                    }
                })
            });
        });
        /*
        @endpoint: /api/me/channels/:id/messages
        @method:GET
        */
        app.get('/api/channels/:id/messages', (req, res, next) => {
            let tokenId = req.get('authorization');
            if (!tokenId) {
                //get token from query
                tokenId = _.get(req, 'query.auth');
            }
            app.models.token.loadTokenAndUser(tokenId).then((token) => {
                const userId = token.userId;
                //make sure user are logged in
                //check if this user is inside of channel members,other return 401
                let filter = _.get(req, 'query.filter', null);
                if (filter) {
                    filter = JSON.parse(filter);
                }
                const channelId = _.get(req, 'params.id');
                const limit = _.get(filter, 'limit', 50);
                const offset = _.get(filter, 'offset', 0);

                //load channel
                this.app.models.channel.load(channelId).then((channel) => {
                    // console.log('channel', channel);
                    const memberIds = _.get(channel, 'members');
                    const members = [];
                    _.each(memberIds, (id) => {
                        members.push(_.toString(id));
                    });
                    if (!_.includes(members, _.toString(userId))) {
                        return res.status('401').json({
                            error: {
                                message: "Access denied"
                            }
                        });
                    }
                    this.app.models.message.getChannelMessages(channelId, limit, offset).then((messages) => {
                        return res.status(200).json(messages);
                    }).catch((err) => {
                        return res.status(404).json({

                            err: { message: 'not found' }
                        });
                    });
                }).catch((err) => {
                    return res.status(404).json({
                        err: { message: 'not found' }
                    });
                });

            }).catch((err) => {
                return res.status(401).json({
                    err: {
                        message: 'Access denied'
                    }
                });
            });


        });
        /*
        @endpoint:/api/users/search
        @method:POST
        */
        app.post('/api/users/search', (req, res, next) => {
            const keyword = _.get(req, 'body.search', '')
            app.models.user.search(keyword).then((result) => {

                return res.status(200).json(result);
            }).catch(() => res.status(404).json('not found'));
        });
        /* 
        @endpoint: /api/users/:id
        @method: GET
        */
        app.get('/api/users/:id', (req, res, next) => {
            const userId = _.get(req, 'params.id');
            // return res.json({ hi: 'there' })

            app.models.user.load(userId).then((user) => {
                _.unset(user, 'password')
                return res.status(200).json(user);
            }).catch((err) => {
                return res.status(404).json({ err });
            })
        });
        /*
        @endpoint:/api/users/login
        @method: post
        login: email,password
        */
        app.post('/api/users/login', (req, res, next) => {
            const body = _.get(req, 'body');
            app.models.user.login(body).then((token) => {
                // console.log("successful login user.", token)
                _.unset(token, 'user.password')
                return res.status(200).json(token);
            }).catch(err => {
                return res.status(401).json({
                    err
                })
            })
        });
        /*
        @endpoint:/api/channels/:channelId
        @method: GET
        */
        app.get('/api/channels/:id', (req, res, next) => {
            const channelId = _.get(req, 'params.id');
            if (!channelId) {
                return res.status(404).json({
                    err: {
                        message: 'Not Found'
                    }
                });
            }
            app.models.channel.load(channelId).then((channel) => {
                //fetch all the user to memberoId
                const members = channel.members;
                const query = {
                    _id: { $in: members },
                }
                const options = {
                    _id: 1,
                    name: 1,
                    created: 1,
                }
                app.models.user.find(query, options).then((users) => {
                    channel.users = users;
                    return res.status(200).json(channel);
                }).catch(err => res.status(404).json({
                    err: {
                        message: 'Not Found'
                    }
                }));

            }).catch((err) => {
                return res.status(404).json({
                    err: {
                        message: 'Not Found'
                    }
                });
            });
        })

    }
}

module.exports = AppRouter;