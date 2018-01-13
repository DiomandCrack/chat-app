const moment = require('moment');
const _ = require('lodash');
const ObjectID = require('Mongodb');
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
    }
}

module.exports = AppRouter;