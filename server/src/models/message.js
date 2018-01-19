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

            this.app.db.collection('messages').insertOne(message, (err, info) => {
                return err ? reject(err) : resolve(message);
            });

        });

    }
}

module.exports = Message;