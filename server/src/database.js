const MongoClient = require('mongodb').MongoClient

const URL = 'mongodb://localhost:27017/chatApp'
    //callback
    // export default class Database {
    //     connect(cb = () => {}) {
    //         MongoClient.connect(URL, (err, db) => {
    //             return cb(err, db);
    //         })
    //     }
    // }

//promise
class Database {

    connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(URL, (err, db) => {
                return err ? reject(err) : resolve(db)
            })
        })
    }
}

module.exports = Database