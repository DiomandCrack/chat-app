const User = require('./user');
const Token = require('./token');
const Connection = require('./connection');
class Model {
    constructor(app) {
        this.app = app;

        this.user = new User(app);
        this.token = new Token(app);
        this.connection = new Connection(app)
    }
}

module.exports = Model;