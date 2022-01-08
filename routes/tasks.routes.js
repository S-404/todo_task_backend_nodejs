const Router = require('express');
const router = new Router();
const TasksController = require('../controllers/tasks.controller');

router.post('/tasks', TasksController.createTask);

router.get('/tasks/list/:usergroupid', TasksController.getTasks);
router.get('/tasks/list/:usergroupid/:taskid', TasksController.getOneTask);
router.get('/tasks/totalcount/:usergroupid', TasksController.countTasks);
router.get('/tasks/changes', TasksController.getTasksLastChange);

router.put('/tasks/task', TasksController.updateTask);
router.put('/tasks/task_status/', TasksController.updateTaskStatus);

router.delete('/tasks/:usergroupid/:taskid', TasksController.deleteTask);

module.exports = router;
