// Main file for the Node/Express web application.
// https://cjoakim-webapp-nodejs1.azurewebsites.net
// Chris Joakim, Microsoft, 2018/11/23

var express= require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.broadcast.emit('hi');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.broadcast.emit('user disconnected');
  });
});


//var dbUrl = ‘mongodb://username:pass@ds257981.mlab.com:57981/simple-chat’;

// mongoose.connect(dbUrl , (err) => { 
//    console.log(‘mongodb connected’,err);
// })

app.set('port', process.env.PORT || 80);

var server = http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
