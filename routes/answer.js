var express = require('express');
var router = express.Router();
var Question = require('../models/Question');
var User = require('../models/User');
var Answer = require('../models/Answer'); 
var util = require('../util');

//create
router.post('/', util.isLoggedin, checkQuestionId, function(req, res){
    var question = res.locals.question;
    req.body.author = req.user._id;
    req.body.question = question._id;

    Answer.create(req.body, function(err, answer){
        if(err){
            req.flash('answerForm',{_id:null, form:req.body});
            req.flash('answerError', {_id:null, errors:util.parseError(err)});

            WREQ
        }
        return res.redirect('/questions/'+question._id+res.locals.getPostQueryString());
    });
});

//accept
router.get('/accept/:id', util.isLoggedin, checkQuestionId, function(req, res){

    var question = res.locals.question;

    Question.findOneAndUpdate(
        {_id:question._id}, 
        {$set:{isPicked: true}}, 
        function(err, results){
            if(err) throw err;
            console.log(results);
    });

    Answer.findOneAndUpdate(
        {_id:req.params.id}, 
        {$set:{isPicked: true}}, 
        function(err, results){
            if(err) throw err;
            console.log(results);
    });
    return res.redirect('/questions/'+question._id+res.locals.getPostQueryString());
  });

module.exports = router;

function checkQuestionId(req,res,next){
    Question.findOne({_id:req.query.questionId}, function(err, question){
        if(err) return res.json(err);
        res.locals.question = question;
        next();
    });
}

