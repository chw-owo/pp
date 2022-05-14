var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
    question:{type:mongoose.Schema.Types.ObjectId, ref:'question', required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    //parentanswer:{type:mongoose.Schema.Types.ObjectId, ref:'answer'}, 
    text:{type:String, required:[true, 'text is required']},
    //isDeleted:{type:Boolean},
    isPicked:{type:Boolean, default:false},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
},{
    toObject:{virtuals:true}
});

answerSchema.virtual('childanswers')
    .get(function() { return this._childanswers;})
    .set(function(value){this._childanswers=value;});

var answer = mongoose.model('answer',answerSchema);

module.exports = answer;
