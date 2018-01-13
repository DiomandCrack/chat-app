'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isEmail = require('../helpers').isEmail;
var _ = require('lodash');

var User = function () {
    function User(app) {
        _classCallCheck(this, User);

        this.app = app;
    }

    _createClass(User, [{
        key: 'beforeSave',
        value: function beforeSave(user) {
            var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            //first is validate user object beforc save to user connection
            var errors = [];

            var fields = ['name', 'email', 'password'];
            var validations = {
                name: {
                    errorMessage: 'Name is require.',
                    do: function _do() {
                        var name = _.get(user, 'name', '');
                        return name.length;
                    }
                },
                email: {
                    errorMessage: 'Email is require.',
                    do: function _do() {
                        var email = _.get(user, 'email', '');
                        if (!email.length || !isEmail(email)) {
                            return false;
                        }
                        return true;
                    }
                },
                password: {
                    errorMessage: 'Password is required and more than 3 charecter.',
                    do: function _do() {
                        var password = _.get(user, 'password', '');
                        if (!password.length || password.length < 6) {
                            return false;
                        }
                        return true;
                    }
                }
            };
            //loop all fields to check if valid or not 
            fields.forEach(function (field) {
                var fieldValidation = _.get(validations, field);
                if (fieldValidation) {
                    // check
                    var isValid = fieldValidation.do();
                    var errMsg = fieldValidation.errorMessage;

                    if (!isValid) {
                        errors.push(errMsg);
                    }
                }
            });

            if (errors.length) {
                //this is not pass of the validation
                var err = _.join(errors, ',');
                return cb(err, null);
            }
            return cb(null, user);
        }
    }, {
        key: 'create',
        value: function create(user) {
            var _this = this;

            var db = this.app.db;
            console.log("User", user);
            return new Promise(function (resolve, reject) {
                _this.beforeSave(user, function (err, user) {

                    console.log('after validation:', err, user);

                    if (err) {
                        return reject(err);
                    }
                    // insert new user object to users collections 
                    db.collection('users').insertOne(user, function (err, info) {
                        //check if error return error to user
                        if (err) {
                            return reject({ message: 'An error saving user' });
                        }
                        //otherwise return user object to user
                        return resolve(user);
                    });
                });
            });
        }
    }]);

    return User;
}();

module.exports = User;
//# sourceMappingURL=user.js.map