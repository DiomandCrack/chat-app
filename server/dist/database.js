'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017/chatapp';

var Database = function () {
    function Database() {
        _classCallCheck(this, Database);
    }

    _createClass(Database, [{
        key: 'connect',
        value: function connect() {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(URL, function (err, db) {
                    /*   if (err) {
                          return reject(err)
                      }
                      return resolve(db) */
                    return err ? reject(err) : resolve(db);
                });
            });
        }
        // connect(cb = () => {}) {
        //     MongoClient.connect(URL, (err, db) => {
        //         return cb(err, db)
        //     });
        // }

    }]);

    return Database;
}();

module.exports = Database;
//# sourceMappingURL=database.js.map