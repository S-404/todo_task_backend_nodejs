const Router = require('express');
const router = new Router();
const UserAccessController = require('../controllers/users_access.controller');

router.post('/user/useraccess', UserAccessController.createUserAccess);

router.get('/user/useraccess/userlist/:usergroup', UserAccessController.getUsersAccess);
router.get('/user/useraccess/:userid/:usergroup', UserAccessController.getOneUserAccess);

router.put('/user', UserAccessController.updateUserAccess);

router.delete('/user/:userid/:usergroup', UserAccessController.deleteUserAccess);

module.exports = router;
