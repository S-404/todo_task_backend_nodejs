const Router = require('express');
const router = new Router();
const TasksController = require('../controllers/task_link.controller');

router.post('/tasklinks', TasksController.createTaskLink);
router.get('/tasklinks/:usergroup', TasksController.getTaskLinks);
router.put('/tasklinks', TasksController.updateTaskLink);
router.delete('/tasklinks/:usergroup/:tasklinkid', TasksController.deleteTaskLink);

module.exports = router;
