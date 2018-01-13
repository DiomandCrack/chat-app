'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = require('./user');

var Model = function Model(app) {
    _classCallCheck(this, Model);

    this.app = app;
    this.user = new User(app);
};

module.exports = Model;
//# sourceMappingURL=index.js.map