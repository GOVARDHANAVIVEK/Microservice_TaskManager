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

module.exports = generateTaskID;
