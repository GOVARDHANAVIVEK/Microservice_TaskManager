const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    Title:{
        type:String,
        required:true
    },Description:{
        type:String,
        required:true
    },DueDate:{
        type:Date,
        required:false,
        default: new Date()
    },Priority:{
        type:Number,
        required:true,
        default: 1
    },Status:{
        type:String,
        required:false,
        default:"New"
    },AssignedTo:{
        type:String,
        required:false,
        default: ""
    },Labels:{
        type: [String], 
        default: [],
        required:false
    },Attachments:{
        type: [String], 
        default: [],
        required:false
    },CreatedBy:{
        type: String, 
        required:false,
        default: ""
    },Comments:{
        type: [String], 
        default: [],
        required:false
    },CreatedAt:{
        type: Date, 
        required:false,
        default: new Date()
    },
    TaskId:{
        type:String,
        required:false
    }
});

const Tasks = mongoose.model('Tasks',taskSchema);
module.exports= Tasks;