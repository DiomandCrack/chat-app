const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const OrderedMap = require('immutable').OrderedMap;
class Token {
    constructor(app) {
        this.app = app;
        this.tokens = new OrderedMap();
    }
    load(tokenId = null) {
        tokenId = `${tokenId}`
        return new Promise((resolve, reject) => {
            this.findTokenById(tokenId, (err, token) => {
                return err ? reject(err) : resolve(token);
            });

        })
    }
    findTokenById(id, cb = () => {}) {
        const objectId = new ObjectID(id);
        const query = { _id: objectId }
        this.app.db.collection('tokens').findOne(query, (err, token) => {
            if (err || !token) {
                return cb({ message: 'Not found' }, null)
            }
            return cb(null, token)
        });
    }
    create(userId) {
        const oneDay = moment().add(1, 'days').toDate();

        const token = {
            userId: userId,
            created: new Date(),
            expired: oneDay,
        };
        return new Promise((resolve, reject) => {
            this.app.db.collection('tokens').insertOne(token, (err, info) => {
                return err ? reject(err) : resolve(token);
            })
        });
    }
}

module.exports = Token;