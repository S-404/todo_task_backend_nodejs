const Router = require('express');
const router = new Router();
const TasksController = require('../controllers/tasks.controller');

router.post('/tasks', TasksController.createTask);

router.get('/tasks/list/:usergroup', TasksController.getTasks);
router.get('/tasks/list/:usergroup/:taskid', TasksController.getOneTask);
router.get('/tasks/totalcount/:usergroup', TasksController.countTasks);
router.get('/tasks/changes', TasksController.getTasksLastChange);

router.put('/tasks', TasksController.updateTask);
router.put('/tasks/task_status/', TasksController.updateTaskStatus);

router.delete('/tasks/:usergroup/:taskid', TasksController.deleteTask);

module.exports = router;
