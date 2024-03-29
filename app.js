// Main file for the Node/Express web application.
// https://cjoakim-webapp-nodejs1.azurewebsites.net
// Chris Joakim, Microsoft, 2018/11/25

var express= require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var bodyParser = require('body-parser');
var azu = require('./lib/azu');
var poll_sleep_ms = 3000;
var poll_data = {};

// Create a Service Bus Util
var sb_opts = {};
sb_opts['queue_name'] = 'outbound'; // process.env.AZURE_SERVICEBUS_OUTBOUND_QUEUE || 'outbound';
sb_opts['key_name']   = process.env.AZURE_SERVICEBUS_KEY_NAME;
sb_opts['key_value']  = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
console.log('creating AzuSvcBusUtil on queue: ' + sb_opts['queue_name']);
var sb_util = new azu.AzuSvcBusUtil(sb_opts);
sb_util.on('done', (evt_obj) => {
  console.log(JSON.stringify(evt_obj, null, 2));
});

// Create a Redis Client
var redis_util = new azu.AzuRedisUtil();
var raw_redis_client = redis_util.raw_client();

// Environment and app-global variables (i.e. - "locals")
var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';
//console.log(app.locals);

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
      if (user_pass === 'secret') {
        authenticated = true;
      }
      if (user_pass === 'q') {
        authenticated = true;
      }
    }
    if (authenticated) {
      var event_count = 0;
      console.log('logon_successful: ' +  user_id);
      io.to(socket.id).emit('logon_successful', user_id);

      socket.handshake.session.auth_user_id = user_id;
      socket.handshake.session.save();

      var cache = new azu.AzuRedisUtil();
      cache.on('done', (evt_obj) => {
          console.log(JSON.stringify(evt_obj, null, 2));
          event_count = event_count + 1;
          if (event_count == 2) {
            cache.quit();
          }
      });
      cache.set('user_session_' + user_id, socket.id);
      cache.set('socket_session_' + socket.id, user_id);
    }
    else {
      console.log('logon_unsuccessful: ' + user_id);
      io.to(socket.id).emit('logon_unsuccessful', user_id);
    }
  });

  socket.on('bus_message', function(msg) {
    var auth_user_id = socket.handshake.session.auth_user_id;
    console.log('bus_message from user: ' + auth_user_id + ' message: ' + msg);
    //io.emit('chat_message', msg);
    io.to(socket.id).emit('chat_message', msg);

    // Create and put a message on Azure Service Bus
    var message = {};
    var body = {};
    body['auth_user_id'] = auth_user_id;
    body['socket_id'] = socket.id;
    body['date'] = (new Date()).toString();
    body['text'] = msg;
    message.body = JSON.stringify(body);
    sb_util.send_message_to_queue(message);
  });

  socket.on('client_poll', function(socket_id) {
    //console.log('client_poll: ' + socket_id);
    var data = poll_data[socket_id];
    //console.log('client_poll from ' + socket_id + ' -> ' + data);
    if (data) {
      io.to(socket_id).emit('client_poll_response', data);
      poll_data[socket_id] = undefined;
      delete poll_data.socket_id;
    }
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    socket.broadcast.emit('user disconnected');
  });
});

app.set('port', process.env.PORT || 80);

var server = http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

function poll_redis_cache(i) {
  console.log('poll_redis_cache - seq: ' + i);
  //console.log('poll_redis_cache - current: ' + JSON.stringify(poll_data, null, 2));

  io.of('/').clients((error, clients) => {
    if (error) throw error;
    for (var i = 0; i < clients.length; i++) {
      var socket_id = clients[i];
      console.log('poll_redis_cache - for socket_id: ' + socket_id);
      raw_redis_client.get(socket_id, (err, reply) => {
        if (reply) {
          try {
            poll_data[socket_id] = reply;
            console.log('poll_redis_cache - reply for: ' + socket_id + ' -> ' + reply);
            var obj = JSON.parse(reply);
            var id  = obj['socket_id'];
            poll_data[id] = reply;
            raw_redis_client.del(id, function(err, response) {
              console.log("poll_redis_cache - delete_key: " + id + ' resp: ' + response + ' err: ' + err);
            });
          }
          catch (err) {
            console.log('poll_redis_cache - error - ' + err);
          }
        }
      });
    }
  });
  setTimeout(poll_redis_cache, poll_sleep_ms, i + 1);
}

setTimeout(poll_redis_cache, poll_sleep_ms, 1);

module.exports = app;
