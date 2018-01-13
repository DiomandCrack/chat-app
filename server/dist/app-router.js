'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');
var START_TIME = new Date();

var AppRouter = function () {
    function AppRouter(app) {
        _classCallCheck(this, AppRouter);

        this.app = app;
        this.setupRouter = this.setupRouter.bind(this);
        this.setupRouter();
    }

    _createClass(AppRouter, [{
        key: 'setupRouter',
        value: function setupRouter() {
            console.log('App Router works');
            /*
            @route:/
            @method: get
            */
            var app = this.app;
            app.get('/', function (req, res, next) {
                return res.json({
                    started: moment(START_TIME).fromNow()
                });
            });
            /*
            @route:/api/user
            @method:post 
            */
            app.post('/api/users', function (req, res, next) {
                var body = req.body;
                app.models.user.create(body).then(function (user) {
                    return res.status(200).json(user);
                }).catch(function (err) {
                    return res.status(503).json({ error: err });
                });
            });
        }
    }]);

    return AppRouter;
}();

module.exports = AppRouter;
//# sourceMappingURL=app-router.js.map