const router = require('express').Router()
const Datastore = require('nedb')
const db = new Datastore({ filename: 'Tasks.db', autoload: true });
const Tasks = require('../models/task_model')
const generateTaskID = require('../middleware/helper')
router.get('/',(req,res)=>{
    return res.status(200).send('getting all tasks')
});


router.post('/createTask',async(req,res)=>{
    console.log("body"+JSON.stringify(req.body))
    // if(req.body.title.length !=0 || req.body.description.length !=0){
    //     return res.status(400).send("Fields cannot be empty")
    // }
    try {
    const taskID = await generateTaskID()
    const newTask = new Tasks({
        Title:req.body.title,
        Description:req.body.description,
        DueDate:req.body.dueDate,
        Priority:req.body.priority,
        Status:req.body.status,
        AssignedTo:req.body.assignedTo,
        labels:req.body.labels,
        Attachments:req.body.attachments,
        CreatedBy:req.body.createdBy,
        Comments:req.body.comments,
        CreatedAt:req.body.createdat,
        TaskId:taskID
    });
    
    try {
        await newTask.save();
        return res.status(201).send(`task created successfully ${taskID}`)
    } catch (error) {
        return res.status(400).send('Task creation failed.')
    }
    } catch (error) {
        return res.status(500).send('Internal Server error.')  
    }
});




module.exports = router