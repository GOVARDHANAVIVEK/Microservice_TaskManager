const TaskId = require('../models/taskId'); // Import the TaskId model

const generateTaskID = async () => {
    try {
        // Check if a task ID record already exists
        let taskRecord = await TaskId.findOne();

        let newId;
        if (!taskRecord) {
            // Create the first task ID if no record exists
            newId = 'Task0000001';
            taskRecord = new TaskId({ Id: newId });
        } else {
            // Extract the numeric part of the existing Id and increment it
            const numericPart = parseInt(taskRecord.Id.replace('Task', ''), 10); // Use `Id` correctly here
            newId = `Task${(numericPart + 1).toString().padStart(7, '0')}`;
            taskRecord.Id = newId; // Update the `Id` field with the new value
        }

        // Save the updated or new record to the database
        await taskRecord.save();

        return newId;
    } catch (error) {
        console.error('Error generating task ID:', error);
        throw error; // Re-throw the error to handle it in calling functions
    }
};
const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next)=>{
    const Bearer_token = req.headers['authorization'];
    if(!Bearer_token || !Bearer_token.startsWith('Bearer')){
        return res.status(404).send("No token found")
    }
    try {
        const token = Bearer_token.split(' ')[1]
        const decodeToken = jwt.verify(token,process.env.secretKey_JWT);
        req.user = decodeToken;
        req.token = token
        console.log(decodeToken)
        next()

    } catch (error) {
       return res.status(500).send(error) 
    }
    
}
const verifyRole = (allowedRoles)=>{
    return (req,res,next)=>{
        try {
            const role = req.user.Role;
            if(allowedRoles.includes(role)){
                return next()
            }
            res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        } catch (error) {
            res.status(500).json({
                message: "Internal server error.",
                error: error.message
            });
        }
    }
    

}





module.exports = {generateTaskID,verifyToken,verifyRole};
