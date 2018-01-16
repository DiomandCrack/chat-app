const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const OrderedMap = require('immutable').OrderedMap;
class Token {
    constructor(app) {
        this.app = app;

        this.tokens = new OrderedMap();
    }
    load(tokenId = null) {
        tokenId = `${tokenId}`;
        return new Promise((resolve, reject) => {

            const tokenFromCache = this.tokens.get(tokenId);
            if (!tokenFromCache) {
                return resolve(tokenFromCache)
            }
            this.findTokenById(tokenId, (err, token) => {
                if (!err && token) {
                    const id = ` ${_.get(token, '_id')}`;
                    this.tokens = this.tokens.set(id, token);
                }
                return err ? reject(err) : resolve(token)
            })
        });
    }
    findTokenById(id, cb = () => {}) {
        console.log('start validate');
        const query = { _id: new ObjectID(id) };
        this.app.db.collection('token').findOne(query, (err, token) => {
            return err || !token ? cb({ message: 'Not found' }) : cb(null, token)
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