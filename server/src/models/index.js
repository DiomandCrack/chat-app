const User = require('./user');
const Token = require('./token');
const Connection = require('./connection');
const Channel = require('./channel');
const Message = require('./message');
class Model {
    constructor(app) {
        this.app = app;

        this.user = new User(app);
        this.token = new Token(app);
        this.channel = new Channel(app);
        this.message = new Message(app);
        this.connection = new Connection(app);

    }
}

module.exports = Model;