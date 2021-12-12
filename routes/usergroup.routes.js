const Router = require('express');
const router = new Router();
const UserAccessController = require('../controllers/usergroup.controller');

router.post('/usergroup', UserAccessController.createUsergroup);
router.get('/usergroup', UserAccessController.getUsergroup);
router.delete('/usergroup', UserAccessController.deleteUsergroup);

module.exports = router;
