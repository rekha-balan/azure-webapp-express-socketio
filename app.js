// Main file for the Node/Express web application.
// Chris Joakim, Microsoft, 2018/11/22

var express    = require('express');
var path       = require('path');
var bodyParser = require('body-parser');
var logger     = require('morgan');
var cookieParser = require('cookie-parser');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Application routers and their mappings
var index_router   = require('./routes/index_router');
var admin_router   = require('./routes/admin_router');
var age_router     = require('./routes/age_router');
var pace_router    = require('./routes/pace_router');
var runwalk_router = require('./routes/runwalk_router');
app.use('/',        index_router);
app.use('/admin',   admin_router);
app.use('/age',     age_router);
app.use('/pace',    pace_router);
app.use('/runwalk', runwalk_router);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler; will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler; no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


//var dbUrl = ‘mongodb://username:pass@ds257981.mlab.com:57981/simple-chat’;

// mongoose.connect(dbUrl , (err) => { 
//    console.log(‘mongodb connected’,err);
// })

module.exports = app;
