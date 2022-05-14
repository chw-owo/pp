var express = require('express');
var router = express.Router();
var User = require('../models/User');
var passport = require('../config/passport');

// signin
router.get('/signin', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('auth/signin', {
    username:username,
    errors:errors
  });
});

// Post signin
router.post('/signin',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('auth/signin');
    }
  },
  passport.authenticate('local-signin', {
    successRedirect : '/',
    failureRedirect : 'auth/signin'
  }
));

// signout
router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

//signup
router.get('/signup', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});

// create
router.post('/signup', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});

module.exports = router;
