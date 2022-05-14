var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();

// DB setting
mongoose.connect('mongodb+srv://chw-owo:gaenary0106@cluster0.aryli.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
var db = mongoose.connection;
//db.dropDatabase();
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});


// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use('/', util.getPostQueryString, require('./routes/question'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/answers', util.getPostQueryString, require('./routes/answer'));

// Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
