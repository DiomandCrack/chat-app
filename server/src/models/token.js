const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const OrderedMap = require('immutable').OrderedMap;
const _ = require('lodash');
class Token {
    constructor(app) {
        this.app = app;

        this.tokens = new OrderedMap();
    }
    logout(token) {
        return new Promise((resolve, reject) => {
            const tokenId = _.toString(token._id);
            //to remove token from cache
            this.tokens = this.tokens.remove(tokenId);
            //delete this token id from tokens collection
            this.app.db.collection('tokens').remove({ _id: new Object(tokenId) }, (err, token) => {
                //console.log(err, log);
                return err ? reject(err) : resolve(token);
            });
        });

    }
    loadTokenAndUser(tokenId) {
        return new Promise((resolve, reject) => {
            this.load(tokenId).then((token) => {
                const userId = `${_.get(token, 'userId')}`;
                this.app.models.user.load(userId).then((user) => {
                    token.user = user;
                    return resolve(token);
                }).catch(err => reject(err));
            }).catch((err) => {
                return reject(err)
            });
        })
    }
    load(tokenId = null) {
        tokenId = `${tokenId}`;
        return new Promise((resolve, reject) => {
            const tokenFromCache = this.tokens.get(tokenId);
            //token save in cache first time
            //1 55.458ms
            //2 4.166ms
            //3 6.195ms
            if (tokenFromCache) {
                return resolve(tokenFromCache);
            }

            this.findTokenById(tokenId, (err, token) => {
                const id = `${_.get(token, '_id')}`;

                if (!err && token) {
                    this.tokens = this.tokens.set(id, token);
                }
                return err ? reject(err) : resolve(token);
            })
        });
    }
    findTokenById(id, cb = () => {}) {
        const query = { _id: new ObjectID(id) };
        this.app.db.collection('tokens').findOne(query, (err, token) => {
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