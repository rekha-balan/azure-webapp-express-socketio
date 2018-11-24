// Main file for the Node/Express web application.
// https://cjoakim-webapp-nodejs1.azurewebsites.net
// Chris Joakim, Microsoft, 2018/11/24

var express= require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var bodyParser = require('body-parser');
var poll_sleep_ms = 5000;

// Environment and app-global variables (i.e. - "locals")
var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';
console.log(app.locals);

app.use(bodyParser.urlencoded({ extended: true }));

// Sessions
var session = require("express-session")({
    secret: "444yccc",
    resave: true,
    saveUninitialized: true
});
app.use(session);
var sharedsession = require("express-socket.io-session");
io.use(sharedsession(session, { autoSave:true })); 

// This is a SPA with only this one Route
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  console.log('socket.handshake.session: ' + JSON.stringify(socket.handshake.session));
  
  socket.broadcast.emit('hi');

  socket.on('logon_submit', function(msg) {
    console.log('logon_submit: ' + msg);
    var creds = msg.trim().split(' ');
    var authenticated = false;
    var user_id = '';
    var user_pass = '';
    console.log(creds);
    if (creds.length === 2) {
      user_id = creds[0];
      user_pass = creds[1];
      if (user_pass === '123') {
        authenticated = true;
      }
    }
    if (authenticated) {
      console.log('logon_successful: ' +  user_id);
      socket.emit('logon_successful', user_id);
    }
    else {
      console.log('logon_unsuccessful: ' + user_id);
      socket.emit('logon_unsuccessful', '');
    }
  });

  socket.on('chat_message', function(msg) {
    console.log('message: ' + msg);
    io.emit('chat_message', msg);

    io.of('/').clients((error, clients) => {
      if (error) throw error;
      console.log(clients);
    });
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

function poll(i) {
  console.log('poll: ' + i);
  io.of('/').clients((error, clients) => {
    if (error) throw error;
    for (var i = 0; i < clients.length; i++) {
      console.log('poll client: ' + clients[i]);
    }
  });
  setTimeout(poll, poll_sleep_ms, i + 1);
}

setTimeout(poll, poll_sleep_ms, 1);

module.exports = app;
