const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const webSocketServer = require('uws').Server;

const PORT = 3000;
const app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({
    exposedHeaders: '*'
}))

app.use(bodyParser.json({
    limit: '50mb'
}))


app.wss = new webSocketServer({
    server: app.server
})

let clients = [];

app.wss.on('connection', (connection) => {
    console.log('new client connected');

    const userId = clients.length;
    const newClient = {
        ws: connection,
        userId
    };
    clients.push(newClient);
    console.log('userId:' + userId)
        //listen event new message from client
    connection.on('message', (message) => {
        console.log(`Got new message from client ${message}`);
        //after getting new message from client, we send back to the client with the new message
        connection.send('hi client');
    })
    connection.on('close', () => {
        console.log(`Client ${userId} disconnected`);
        clients = clients.filter((client) => client.userId !== userId)
    })
})

app.get('/', (req, res) => {
    res.json({

    })
})

app.get('/api/all_connections', (req, res, next) => {
    return res.json({
        prople: clients
    });
});

setInterval(() => {
    //each 3 seconds this function be excuted
    console.log(`${clients.length} in connection`)
    if (clients.length > 0) {
        clients.forEach((client) => {
            console.log('client ID', client.userId)
            const msg = `${client.userId}:you got a new message from server`
            client.ws.send(msg)
        });
    }
}, 3000)

app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
})