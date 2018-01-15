const moment = require('moment');
const _ = require('lodash');
const START_TIME = new Date();
class AppRouter {
    constructor(app) {
        this.app = app;
        this.setupRouter = this.setupRouter.bind(this)
        this.setupRouter();
    }


    setupRouter() {
        const app = this.app;
        console.log("APP Router works");

        /*
        @endpoint:/
        @method:GET
        */
        app.get('/', (req, res, next) => {
            return res.json({ time: moment(START_TIME).fromNow() })
        });
        /*
        @endpoint: /
        @method: POST
        */
        app.post('/api/users', (req, res, next) => {
            const body = req.body;
            app.models.user.create(body).then((user) => {
                _.unset(user, 'password');
                return res.status(200).json(user);
            }).catch((err) => {
                return res.status(503).json({
                    err
                })
            });

        });
        /* 
        @endpoint: /api/users/:id
        @method: GET
        */
        app.get('/api/users/:id', (req, res, next) => {
            const userId = _.get(req, 'params.id')
                // return res.json({ hi: 'there' })

            app.models.user.load(userId).then((user) => {
                _.unset(user, 'password')
                return res.status(200).json(user);
            }).catch((err) => {
                return res.status(404).json({ err });
            })
        });
        /*
        @endpoint:/api/users/login
        @method: post
        login: email,password
        */
        app.post('/api/users/login', (req, res, next) => {
            const body = _.get(req, 'body');
            app.models.user.login(body).then((token) => {
                console.log("successful login user.", token)
                _.unset(token, 'user.password')
                return res.status(200).json(token);
            }).catch(err => {
                return res.status(401).json({
                    err
                })
            })
        })
    }
}

module.exports = AppRouter;