const _ = require('lodash');
const OrderedMap = require('immutable').OrderedMap;
const ObjectID = require('mongodb').ObjectID;
class Message {
    constructor(app) {
        this.app = app;
        this.messages = new OrderedMap();
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