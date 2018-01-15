const moment = require('moment');
class Token {
    constructor(app) {
        this.app = app;
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