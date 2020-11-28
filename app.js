var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db = require('./database');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

var app = express();

var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: '*'}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/books', booksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  req.locals.message = err.message;
  req.locals.error = req.app.get('env') === 'development' ? err : {};


  req.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  req.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');


  // render the error page
  req.status(err.status || 500);
  req.render('error');
});

module.exports = app;
