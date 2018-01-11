const MongoClient = require('mongodb').MongoClient
const URL = 'mongodb://localhost:27017/chatapp'
class Database {
    constructor() {

    }
    connect() {
        MongoClient.connect(URL, (err, db) => {
            console.log('Connecting to database with err', err)
        });
    }
}

module.exports = Database