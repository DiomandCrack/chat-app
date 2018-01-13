'use strict';

var http = require('http');
var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var webSocketServer = require('uws').Server;

//require database
var Database = require('./database');

var Model = require('./models');
var AppRouter = require('./app-router');

var PORT = 3001;
var app = express();
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
new Database().connect().then(function (db) {
    console.log("Successful connected to database");
    app.db = db;
}).catch(function (err) {
    throw err;
});
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

app.server.listen(process.env.PORT || PORT, function () {
    console.log('App is running on port ' + app.server.address().port);
});

module.exports = app;
//# sourceMappingURL=index.js.map