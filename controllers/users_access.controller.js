const sql = require('mssql');
const config = require('../config');

class UserAccessController {
  async createUserAccess(req, res) {
    const { USERGROUP_ID, USERID, ISADMIN } = req.query;
    const pool = await sql.connect(config);
    const newUser = await pool.request().query(
      `
      IF EXISTS (
        SELECT * FROM USERS_ACCESS 
        WHERE USERID = '${USERID}'
        AND USERGROUP_ID = ${USERGROUP_ID}
        )
        BEGIN
          UPDATE USERS_ACCESS 
          SET ISADMIN = ${ISADMIN === 'true' ? 1 : 0} 
          OUTPUT inserted.*
          WHERE USERGROUP_ID = ${USERGROUP_ID}
          AND USERID = '${USERID}';
        END
      ELSE
        BEGIN
          INSERT INTO USERS_ACCESS 
          (USERGROUP_ID, USERID, ISADMIN) 
          OUTPUT inserted.*
          VALUES 
          (${USERGROUP_ID},N'${USERID}', ${ISADMIN === 'true' ? 1 : 0});
        END
      `
    );
    res.json(newUser.recordset);
  }
  async getUsersAccess(req, res) {
    const { usergroupid } = req.params;
    const pool = await sql.connect(config);
    const userList = await pool.request().query(
      `SELECT *
      FROM [USERS_ACCESS] WHERE USERGROUP_ID = ${usergroupid}
      ;`
    );
    res.json(userList.recordset);
  }
  async getOneUserAccess(req, res) {
    const { userid, usergroupid } = req.params;
    const pool = await sql.connect(config);
    const user = await pool.request().query(
      `SELECT *
      FROM [USERS_ACCESS] WHERE USERGROUP_ID = ${usergroupid} AND USERID = '${userid}'
      ;`
    );

    res.json(user.recordset);
  }
  async updateUserAccess(req, res) {
    const { USERGROUP_ID, USERID, ISADMIN } = req.query;
    const pool = await sql.connect(config);
    const userUpd = await pool.request().query(
      `UPDATE USERS_ACCESS 
      SET ISADMIN = ${ISADMIN === 'true' ? 1 : 0} 
      OUTPUT inserted.*
      WHERE USERGROUP_ID = ${USERGROUP_ID}
      AND USERID = '${USERID}';`
    );
    res.json(userUpd.recordset);
  }
  async deleteUserAccess(req, res) {
    const { userid, usergroupid } = req.params;
    const pool = await sql.connect(config);
    const userDel = await pool.request().query(
      `DELETE FROM [USERS_ACCESS] 
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroupid} AND USERID = '${userid}';
      IF NOT EXISTS (SELECT * FROM USERS_ACCESS WHERE USERGROUP_ID = ${usergroupid})
      BEGIN
      DELETE FROM [USERGROUPS] 
      WHERE USERGROUP_ID = ${usergroupid};
      DELETE FROM [TASK_LINKS] 
      WHERE USERGROUP_ID = ${usergroupid};
      DELETE FROM [TASK_NOTES] 
      WHERE USERGROUP_ID = ${usergroupid};
      DELETE FROM [TASKS] 
      WHERE USERGROUP_ID = ${usergroupid};
      END
      `
    );
    res.json(userDel.recordset);
  }
}

module.exports = new UserAccessController();
