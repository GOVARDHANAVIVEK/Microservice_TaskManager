const mongoose = require('mongoose');

const getId = mongoose.Schema({
    Id:{
        type:String,
        default: 'Task0000000'
    }
});

const TaskId = mongoose.model('TaskID',getId);
module.exports = TaskId;