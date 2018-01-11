const moment = require('moment');
const START_TIME = new Date();
class AppRouter {
    constructor(app) {
        this.app = app;
        this.setUpRouter = this.setUpRouter.bind(this)
        this.setUpRouter();
    }
    setUpRouter() {
        console.log('App Router works');
        /*
        @route:/
        @method: get
        */
        const app = this.app;
        app.get('/', (req, res, next) => {
            return res.json({
                started: moment(START_TIME).fromNow(),
            })
        });
        /*
        @route:/api/user
        @method:post 
        */
        app.post('/api/users', (req, res, next) => {
            const body = req.body;
            app.models.user.create(body)
            return res.status(200).json(body)
        })
    }
}

module.exports = AppRouter