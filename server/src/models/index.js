const User = require('./user');
const Token = require('./token');
const Connection = require('./connection');
const Channel = require('./channel')
class Model {
    constructor(app) {
        this.app = app;

        this.user = new User(app);
        this.token = new Token(app);
        this.connection = new Connection(app);
        this.channel = new Channel(app);
    }
}

module.exports = Model;