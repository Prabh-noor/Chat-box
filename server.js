const express = require('express')
const app = express()
const socketIO = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const websocket = socketIO(server)

app.use(express.static(__dirname+'/public'));
// Serve static files from node modules
// app.use('/vendor', express.static(__dirname+'/node_modules'));

app.get('/', function(req, res){
    res.render('index.ejs')
})

websocket.on('connection', function(socket){
    console.log('A user got connected')

    socket.on('newAnnouncement', function(data, callback){
        try{
            let message = "";
            if(data.type == "newUser"){
                message = "New user joined with name "+data.value;
            }else if(data.type == "changeName"){
                message = data.prev+" changed their name to "+data.value;
            }
            if(message != ''){
                websocket.emit('newAnnouncement', message);
            }
        } catch (error) {
            callback("Something went wrong!")
        }
    })

    socket.on('newMessage', function(message, callback){
        try {
            websocket.emit('newMessage', message)
            callback('success')
        } catch (error) {
            callback('error')
        }
    })
    socket.on('disconnect', function(){
        console.log('A user got disconnected')
    })
    
})

server.listen(3000, () => console.log("Server is listening on port 3000"))