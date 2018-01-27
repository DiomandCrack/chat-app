const _ = require('lodash');
const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
class Message {
    constructor(app) {
        this.app = app;
        this.messages = new OrderedMap();
    }
    getChannelMessages(channelId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            channelId = new ObjectID(channelId);
            // this.app.db.collection('messages').find({ channelId }).skip(offset).limit(limit).toArray((err, messages) => {
            //     return err ? reject(err) : resolve(messages);
            // });
            const query = [{
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    }
                },
                {
                    $match: {
                        channelId: {
                            $eq: channelId,
                        }
                    }
                },
                {
                    $project: {
                        _id: true,
                        channelId: true,
                        user: {
                            $arrayElemAt: ['$user', 0]
                        },
                        userId: true,
                        main: true,
                        created: true,

                    }
                },
                {
                    $project: {
                        _id: true,
                        channelId: true,
                        user: {
                            _id: true,
                            name: true,
                            created: true,
                            online: true,
                        },
                        userId: true,
                        main: true,
                        created: true,

                    }
                },
                {
                    $limit: limit,
                },
                {
                    $skip: offset,
                },
                {
                    $sort: {
                        created: 1
                    }
                }
            ];
            this.app.db.collection('messages').aggregate(query, (err, messages) => {
                // console.log(err);
                return err ? reject(err) : resolve(messages);
            });
        });
    }
    create(obj) {
        return new Promise((resolve, reject) => {
            const id = _.toString(_.get(obj, '_id', null));
            const channelId = new ObjectID(_.get(obj, 'channelId'));
            const userId = new ObjectID(_.get(obj, 'userId'));
            const message = {
                _id: new ObjectID(id),
                main: _.get(obj, 'main', ''),
                userId,
                channelId,
                created: new Date(),
            }
            const app = this.app;
            app.db.collection('messages').insertOne(message, (err, info) => {

                if (!err) {
                    //let update lastMessage field to channel
                    app.db.collection('channels').findOneAndUpdate({ _id: channelId }, {
                        $set: {
                            lastMessage: _.get(message, 'main', ''),
                            updated: new Date(),
                        }
                    });
                    app.models.user.load(_.toString(userId)).then((user) => {
                        _.unset(user, 'password');
                        _.unset(user, 'email');
                        message.user = user;
                        return resolve(message);
                    }).catch(err => reject(err));
                } else {
                    return reject(err);
                }
            });

        });

    }
}

module.exports = Message;