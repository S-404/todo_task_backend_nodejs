const Router = require('express');
const router = new Router();
const UserAccessController = require('../controllers/users_access.controller');

router.post('/user/useraccess', UserAccessController.createUserAccess);

router.get(
  '/user/useraccess/userlist/:usergroupid',
  UserAccessController.getUsersAccess
);
router.get(
  '/user/useraccess/:userid/:usergroupid',
  UserAccessController.getOneUserAccess
);

router.put('/user', UserAccessController.updateUserAccess);

router.delete(
  '/user/:userid/:usergroupid',
  UserAccessController.deleteUserAccess
);

module.exports = router;
