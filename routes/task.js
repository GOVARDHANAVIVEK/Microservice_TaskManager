const router = require('express').Router()
const Datastore = require('nedb')
const db = new Datastore({ filename: 'Tasks.db', autoload: true });
const Tasks = require('../models/task_model')
const {generateTaskID,verifyToken,verifyRole} = require('../middleware/helper')
const axios = require('axios');
const dotenv = require('dotenv').config()
const ProjectServiceUrl = process.env.ProjectServiceURI;

router.post('/createTask',verifyToken,verifyRole(['Project_Manager','Admin']),async(req,res)=>{
    console.log("body"+JSON.stringify(req.body))
 
    const {projectId} = req.body;
    console.log(projectId)
    if (!projectId) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: "ProjectId is required.",
        });
      }
    
    try {
        console.log("`${ProjectServiceUrl}/${projectId}`"+`${ProjectServiceUrl}/${projectId}`)
        const projectResponse = await axios.get(`${ProjectServiceUrl}/${projectId}`);
        console.log("projectResponse",projectResponse)
        if (!projectResponse.data.success) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "Project not found.",
        });
        }
        console.log("req.project==>"+projectResponse.data.result.ProjectId)
        const taskID = await generateTaskID()
        const newTask = new Tasks({
            Title:req.body.title,
            Description:req.body.description,
            DueDate:req.body.dueDate,
            Priority:req.body.priority,
            Status:req.body.status,
            AssignedTo:req.body.assignedTo,
            Labels:req.body.labels,
            Attachments:req.body.attachments,
            CreatedBy:req.body.createdBy,
            Comments:req.body.comments,
            CreatedAt:req.body.createdat,
            TaskId:taskID,
            ProjectId:projectResponse.data.result.ProjectId
            
        });
        console.log(newTask)
    try {
        await newTask.save();
        console.log(typeof(taskID))
        await axios.put(`${ProjectServiceUrl}/${projectId}/addTask`, {
            taskId: taskID,
          },
          {
            headers: {
              Authorization: `Bearer ${req.token}`, // Replace req.token with your actual token variable
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(200).json({
            success:true,
            status:200,
            ok:true,
            data:newTask
        })
    } catch (error) {
        return res.status(400).send('Task creation failed.')
    }
    } catch (error) {
        return res.status(500).send('Internal Server error.')  
    }
});


router.get('/',async(req,res)=>{
    const {status,priority,createdBy,assignedTo,dueDate,sortBy, limit, page}=req.query
    console.log("query---",req.query)
    const query={}

    if(status) query.Status = status
    if(priority) query.Priority = parseInt(priority)
    if(createdBy) query.CreatedBy= createdBy
    if(assignedTo) query.AssignedTo = assignedTo
    if(dueDate) query.DueDate = dueDate
    
    const sort={}
  
    if (sortBy) {
        const [field, order] = sortBy.split(':');
        if (field && order) {
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            console.error('Invalid sortby format. Expected "field:order".');
        }
    }
    
    console.log("Sort Object:", sort);
   
    const perPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;


   
    try {
        const tasks = await Tasks.find(query).sort(sort).skip((currentPage - 1) * perPage).limit(perPage)
        return res.status(200).json({
            success:true,
            status:200,
            ok:true,
            data:tasks

        })
    } catch (error) {
        return  res.status(500).json({
            success: false,
            message: 'Error fetching tasks.',
            error:error
        });
    }
});

router.get('/:taskid',async(req,res)=>{
    const {taskid} = req.params;
    try {
        const task = await Tasks.find({TaskId:taskid})
        console.log(taskid)
        if(task){
            return res.status(200).json({
                success:true,
                status:200,
                ok:true,
                data:task
            })  
        }else{
            return res.status(400).json({
                status:400,
                message:"No task found"
            })  
        }
    } catch (error) {
        return res.status(500).json({
            status:500,
            message:"Internal Server Error",
            error:error
        })  
    }
});

router.put('/:taskid',verifyToken,verifyRole(['Project_Manager','Admin','Team_Member']),async(req,res)=>{
    const {taskid} = req.params;
    
    try {
        console.log(req.body.projectId)
        const task = await Tasks.findOne({TaskId:taskid})
        if(task){
            task.Title = req.body.title !== undefined ? req.body.title : task.Title;
            task.Description = req.body.description !== undefined ? req.body.description : task.Description;
            task.DueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.DueDate;
            task.Priority = req.body.priority !== undefined ? req.body.priority : task.Priority;
            task.Status = req.body.status !== undefined ? req.body.status : task.Status;
            task.AssignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.AssignedTo;
            task.Labels = req.body.labels !== undefined ? task.Labels=[...task.Labels,...req.body.labels] : task.Labels;
            task.Attachments = req.body.attachments !== undefined ? task.Attachments=[...task.Attachments,...req.body.attachments] : task.Attachments;
            task.Comments = req.body.comments !== undefined ? task.Comments=[...task.Comments,...req.body.comments] : task.Comments;
            task.ProjectId = req.body.projectId!==undefined ? req.body.projectId : task.ProjectId
            console.log(task)
            const updatedTask = await task.save();
            return res.status(200).json({
                success:true,
                status:200,
                ok:true,
                data:updatedTask
            });
        }else{
            return res.status(200).json({
                status:404,
                message:"No task found"
            });
        }
    } catch (error) {
        return res.status(200).json({
            status:500,
            message:"Something went wrong",
            error:error
        });
    }
});

router.delete('/:taskid',verifyToken,verifyRole(['Project_Manager','Admin']),async(req,res)=>{
    const {taskid} = req.params;
    console.log("taskid---->",{taskid})
    try {
        const task = await Tasks.findOne({TaskId:taskid});
        if (!task) return res.status(404).json({
            status:404,
            message:"Task not found."
        });
        console.log("task",task)
        console.log('`${ProjectServiceUrl}/${task.ProjectId}/${taskid}`'+`${ProjectServiceUrl}/${task.ProjectId}/${taskid}`)
        
        await task.deleteOne()
        console.log("req.token"+req.token)
        const resposne = await axios.delete(`${ProjectServiceUrl}/${task.ProjectId}/${taskid}`,
          {
            headers: {
              Authorization: `Bearer ${req.token}`, // Replace req.token with your actual token variable
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(200).json({
            success:true,
            status:200,
            ok:true,
            message:"Task deleted successfully."

        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            
            status:500,
            message:"Something went wrong.",
            error:error


        });
    }
        
});

module.exports = router