const _ = require('lodash');
const toString = require('../helper').toString;
const ObjectID = require('mongodb').ObjectID;
const OrderedMap = require('immutable').OrderedMap;

class Channel {
    constructor(app) {
        this.app = app;
        this.channels = new OrderedMap();
    }
    load(id) {
        return new Promise((resolve, reject) => {
            id = _.toString(id);
            //first find in cache
            const channelFromCache = this.channels.get(id);
            if (channelFromCache) {
                return resolve(channelFromCache);
            }
            //find in db
            this.findById(id).then((channel) => resolve(channel)).catch(err => reject(err));
        });

    }
    aggregate(q) {
        return new Promise((resolve, reject) => {
            this.app.db.collection('channels').aggregate(q, (err, channel) => {
                return err ? reject(err) : resolve(channel);
            });
        });
    }
    find(q, options = {}) {
        console.log(q)
        return new Promise((resolve, reject) => {
            this.app.db.collection('channels').find(q, options).toArray((err, channel) => {
                return err ? reject(err) : resolve(channel);
            });
        });
    }
    findById(id) {

        return new Promise((resolve, reject) => {
            this.app.db.collection('channels').findOne({ _id: new ObjectID(id) }, (err, channel) => {
                if (err || !channel) {
                    return reject(err ? err : 'not found');
                }
                return resolve(channel);
            });
        });
    }
    create(obj) {

        return new Promise((resolve, reject) => {

            let id = toString(_.get(obj, '_id'));
            let objectId = id ? new ObjectID(id) : new ObjectID;
            let members = [];
            _.each(_.get(obj, 'members', []), (value, key) => {
                console.log('key', key, value);
                const memberObjectId = new ObjectID(key);
                members.push(memberObjectId);
            });
            const channel = {
                _id: objectId,
                title: _.get(obj, 'title', ''),
                lastMessage: _.get(obj, 'lastMessage', ''),
                created: new Date(),
                userId: _.get(obj, 'userId'),
                members: members,
            };
            console.log('channel:', channel);
            this.app.db.collection('channels').insertOne(channel, (err, info) => {
                if (!err) {
                    const channelId = channel._id.toString();
                    this.channles = this.channels.set(channelId, channel);
                }
                return err ? reject(err) : resolve(channel);
            });

        });
    }
}

module.exports = Channel;