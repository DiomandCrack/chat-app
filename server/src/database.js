const MongoClient = require('mongodb').MongoClient
const URL = 'mongodb://localhost:27017/chatapp'
class Database {
    connect() {
            return new Promise((resolve, reject) => {
                MongoClient.connect(URL, (err, db) => {
                    /*   if (err) {
                          return reject(err)
                      }
                      return resolve(db) */
                    return err ? reject(err) : resolve(db)
                })
            })
        }
        // connect(cb = () => {}) {
        //     MongoClient.connect(URL, (err, db) => {
        //         return cb(err, db)
        //     });
        // }
}

module.exports = Database