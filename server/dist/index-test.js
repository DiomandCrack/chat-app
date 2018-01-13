'use strict';

var http = require('http');
var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var webSocketServer = require('uws').Server;

var PORT = 3000;
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

var clients = [];

app.wss.on('connection', function (connection) {
    console.log('new client connected');

    var userId = clients.length;
    var newClient = {
        ws: connection,
        userId: userId
    };
    clients.push(newClient);
    console.log('userId:' + userId);
    //listen event new message from client
    connection.on('message', function (message) {
        console.log('Got new message from client ' + message);
        //after getting new message from client, we send back to the client with the new message
        connection.send('hi client');
    });
    connection.on('close', function () {
        console.log('Client ' + userId + ' disconnected');
        clients = clients.filter(function (client) {
            return client.userId !== userId;
        });
    });
});

app.get('/', function (req, res) {
    res.json({});
});

app.get('/api/all_connections', function (req, res, next) {
    return res.json({
        prople: clients
    });
});

setInterval(function () {
    //each 3 seconds this function be excuted
    console.log(clients.length + ' in connection');
    if (clients.length > 0) {
        clients.forEach(function (client) {
            console.log('client ID', client.userId);
            var msg = client.userId + ':you got a new message from server';
            client.ws.send(msg);
        });
    }
}, 3000);

app.server.listen(process.env.PORT || PORT, function () {
    console.log('App is running on port ' + app.server.address().port);
});
//# sourceMappingURL=index-test.js.map