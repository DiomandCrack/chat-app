const _ = require('lodash');
const isEmail = require('../helper').isEmail;
//decode
const bcrypt = require('bcrypt');
const saltRound = 10;
class User {
    constructor(app) {
        this.app = app;
    }

    // load(id) {
    //     return new Promise((resolve, reject) => {

    //         this.findUserById(id, (err, user) => {
    //             if (!err && user) {
    //                 const users = this.users.set(id, user);
    //             }
    //             return err ? reject(err) : resolve(user)
    //         });

    //     });
    // }

    // findUserById(id, cb = () => {}) {
    //     if (!id) {
    //         return cb({ message: "user not found" }, null)
    //     }
    //     const userId = new ObjectID(id);
    //     this.app.db.collection('users').findOne({ _id: userId }, (err, result) => {
    //         if (err || !result) {
    //             return cb({ message: 'User not found' })
    //         }
    //         return cb(null, result)
    //     })
    // }

    beforeSave(user, cb = () => {}) {
        let errors = [];
        const fields = ['name', 'email', 'password'];
        const validations = {
            name: {
                errorMessage: 'Name is required',
                do: () => {
                    const name = _.get(user, 'name', '');
                    return name.length;
                }
            },
            email: {
                errorMessage: 'email is required',
                do: () => {
                    const email = _.get(user, 'email', '');

                    if (!email.length || !isEmail(email)) {
                        return false
                    }
                    return true;
                }
            },
            password: {
                errorMessage: 'Password is required and more than 3 charecters.',
                do: () => {
                    const password = _.get(user, 'password', '');
                    if (!password.length || password.length < 3) {
                        return false
                    }
                    return true;
                }
            }
        };

        //loop all fields to check if valid or not
        fields.forEach(field => {
            const fieldValidation = _.get(validations, field)
            if (fieldValidation) {
                //do checked
                const isValid = fieldValidation.do();
                const errMsg = _.get(fieldValidation, 'errorMessage')
                console.log(errMsg)
                if (!isValid) {
                    errors.push(errMsg);
                }
            }
        });
        if (errors.length) {
            const err = _.join(errors, ',')
            return cb(err, null)
        }
        //validate email that is unique
        const email = _.toLower(_.trim(_.get(user, 'email', '')));
        this.app.db.collection('users').findOne({ email }, (err, result) => {
            console.log("checked", err, result)
            if (err || result) {
                return cb({ message: 'Email is already exist' }, null)
            }
            //return cb with success checked
            const password = _.get(user, 'password');
            const hashPassword = bcrypt.hashSync(password, saltRound);
            const name = _.trim(_.get(user, 'name'));

            const userFormatted = {
                name: name,
                email,
                password: hashPassword,
                created: new Date(),
            };
            return cb(null, userFormatted);
        });
    }

    create(user) {
        const db = this.app.db
        return new Promise((resolve, reject) => {

            this.beforeSave(user, (err, user) => {
                console.log('create', err, user)
                if (err) {
                    return reject(err)
                }
                //insert User object to collections
                db.collection('users').insertOne(user, (err, info) => {

                    //IF ERROR RETURN ERROR OF USER
                    if (err) {
                        return reject({ message: 'An err saving user' })
                    }
                    //insert user to database
                    return resolve(user)
                });
            });
        });
    }
}

module.exports = User