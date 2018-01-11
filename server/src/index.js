const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const webSocketServer = require('uws').Server;

//require database
const Database = require('./database')

const Model = require('./models');
const AppRouter = require('./app-router');

const PORT = 3001;
const app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({
    exposedHeaders: '*'
}));

app.use(bodyParser.json({
    limit: '50mb'
}));


app.wss = new webSocketServer({
    server: app.server
});
//connect to Mongo database 
//promise
new Database().connect().then((db) => {
        console.log("Successful connected to database")
        app.db = db;
    }).catch((err) => {
        throw (err)
    })
    /* 
    //callback function ver
    new Database().connect((err, db) => {
        console.log('Connecting to database with err', err)
        if (err) {
            throw (err);
        }
        console.log("successful connect to database")
        app.db = db;
    }); */
    //end to Mongo
app.models = new Model(app);
app.routers = new AppRouter(app);


app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
})