var express  = require('express');
var router = express.Router();
var Question = require('../models/Question');
var User = require('../models/User');
var Answer = require('../models/Answer'); 
var util = require('../util');

// Index
router.get('/', async function(req, res){
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page)?page:1;
  limit = !isNaN(limit)?limit:10;

  var skip = (page-1)*limit;
  var maxPage = 0;
  var searchQuery = await createSearchQuery(req.query);
  var questions = [];

  if(searchQuery) {
    var count = await Question.countDocuments(searchQuery);
    maxPage = Math.ceil(count/limit);
    questions = await Question.find(searchQuery)
      .populate('author')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  res.render('questions/index', {
    questions:questions,
    currentPage:page,
    maxPage:maxPage,
    limit:limit,
    searchType:req.query.searchType,
    searchText:req.query.searchText
  });
});

// New
router.get('/questions/new', util.isLoggedin, function(req, res){
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('questions/new', { post:post, errors:errors });
});

// create
router.post('/questions', util.isLoggedin, function(req, res){
  req.body.author = req.user._id;
  Question.create(req.body, function(err, post){
    if(err){
      req.flash('question', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/questions/new'+res.locals.getPostQueryString());
    }
    res.redirect('/'+res.locals.getPostQueryString(false, { page:1, searchText:'' }));
  });
});

// show
router.get('/questions/:id', function(req, res){

  var answerForm = req.flash('answerForm')[0] || {_id:null, form: {}};
  var answerError = req.flash('answerError')[0] || { _id:null, parentanswer: null, errors:{}};
  
  Promise.all([
    Question.findOne({_id:req.params.id}).populate({path: 'author', select: 'username'}),
    Answer.find({question:req.params.id}).sort('createdAt').populate({path: 'author', select: 'username'})
  ])
  .then(([question, answers]) => {
      res.render('questions/show', {question:question, answers:answers, answerForm:answerForm, answerError:answerError});
  })
  .catch((err) => {
    console.log('err: ', err);
    return res.json(err);
  });

});

// edit
router.get('/questions/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var question = req.flash('question')[0];
  var errors = req.flash('errors')[0] || {};
  if(!question){
    Question.findOne({_id:req.params.id}, function(err, question){
        if(err) return res.json(err);
        res.render('Questions/edit', { question:question, errors:errors });
      });
  }
  else {
    post._id = req.params.id;
    res.render('questions/edit', { question:question, errors:errors });
  }
});

// update
router.put('/questions/:id', util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now();
  Question.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, question){
    if(err){
      req.flash('question', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/questions/'+req.params.id+'/edit'+res.locals.getPostQueryString());
    }
    res.redirect('/questions/'+req.params.id+res.locals.getPostQueryString());
  });
});

// destroy
router.delete('/questions/:id', util.isLoggedin, checkPermission, function(req, res){
  Question.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/');
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  Question.findOne({_id:req.params.id}, function(err, question){
    if(err) return res.json(err);
    if(question.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

async function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if(searchTypes.indexOf('title')>=0){
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('body')>=0){
      postQueries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('author!')>=0){
      var user = await User.findOne({ username: queries.searchText }).exec();
      if(user) postQueries.push({author:user._id});
    }
    else if(searchTypes.indexOf('author')>=0){
      var users = await User.find({ username: { $regex: new RegExp(queries.searchText, 'i') } }).exec();
      var userIds = [];
      for(var user of users){
        userIds.push(user._id);
      }
      if(userIds.length>0) postQueries.push({author:{$in:userIds}});
    }
    if(postQueries.length>0) searchQuery = {$or:postQueries};
    else searchQuery = null;
  }
  return searchQuery;
}
