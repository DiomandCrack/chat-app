'use strict';

var WebSocket = require('uws');

var ws = new WebSocket('ws://localhost:3000/');

ws.on('open', function () {
    console.log("Success connected to the server");

    //send message from client to server
    ws.send('hello server');
    //listen event message from server 
    ws.on('message', function (message) {
        console.log('Got back message from the server:' + message);
    });

    /*     ws.send('close', () => {
            console.log('client disconnected')
        }) */
});
//# sourceMappingURL=client.js.map