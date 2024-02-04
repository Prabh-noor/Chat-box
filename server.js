const express = require('express')
const app = express()
const socketIO = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const websocket = socketIO(server)

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res){
    res.render('index.ejs')
})

websocket.on('connection', function(socket){
    console.log('A user got connected')

    // socket.on('setUsername', function(message, acknowledgementCallback){
    //     try{
    //     } catch (error) {
    //     }
    // })
    socket.on('newMessage', function(message, acknowledgementCallback){
        try {
            websocket.emit('newMessage', message)
            acknowledgementCallback('success')
        } catch (error) {
            acknowledgementCallback('error')
        }
    })
    socket.on('disconnect', function(){
        console.log('A user got disconnected')
    })
    
})

server.listen(3000, () => console.log("Server is listening on port 3000"))