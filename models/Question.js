var mongoose = require('mongoose');

// schema
var questionSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  isPicked:{type:Boolean, defalut:false},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

// model & export
var Question = mongoose.model('question', questionSchema);
module.exports = Question;
