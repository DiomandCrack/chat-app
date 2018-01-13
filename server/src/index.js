const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const WebSocketServer = require('uws');
const Server = WebSocketServer.Server
const AppRouter = require('./app-router');
const Model = require('./models/index');
const Database = require('./database');
const path = require('path')
const PORT = 3001;
const app = express();
app.server = http.createServer(app);


app.use(morgan('dev'));


app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

// Connect to Mongo Database
//promise
new Database().connect().then((db) => {
    console.log('successful connect to database')
    app.db = db;
}).catch((err) => {
    throw (err);
})

// End connect to Mongodb Database

// Connect to Mongo Database
//callback
// new Database().connect((err, db) => {
//     if (err) {
//         throw (err)
//     }
//     console.log('successfully to connet to database')
//     app.db = db
// })


// End connect to Mongodb Database
app.models = new Model(app)
app.routers = new AppRouter(app)



app.wss = new Server({
    server: app.server
});


/*
let clients = [];
app.wss.on('connection', (connection) => {
	
	const userId = clients.length + 1;
	
	connection.userId = userId;
	const newClient = {
		ws: connection,
		userId: userId,
	};
	clients.push(newClient);
	console.log("New client connected with userId:", userId);
	connection.on('message', (message) => {
		console.log("message from:", message);
	});
	connection.on('close', () => {
		console.log("client with ID ", userId, ' is disconnected');
		clients = clients.filter((client) => client.userId !== userId);
	});
});
*/





app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
});

module.exports = app;