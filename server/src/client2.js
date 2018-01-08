const WebSocket = require('uws')

const ws = new WebSocket('ws://localhost:3000/')

ws.on('open', () => {
    console.log("Success connected to the server")

    //send message from client to server
    /*     ws.send('hello server'); */
    //listen event message from server 
    /*     ws.on('message', (message) => {
            console.log('Got back message from the server:' + message)
        }) */

    ws.send('close', () => {
        console.log('client disconnected')
    })
})