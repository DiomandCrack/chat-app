const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const webSocketServer = require('uws').Server;

const Model = require('./models/index')
const AppRouter = require('./app-router')

const PORT = 3001;
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

app.models = new Model(app);
app.routers = new AppRouter(app)


app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
})