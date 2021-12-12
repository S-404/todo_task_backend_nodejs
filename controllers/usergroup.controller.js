const sql = require('mssql');
const config = require('../config');

class UserGroupController {
  async createUsergroup(req, res) {
    const { name } = req.query;
    const pool = await sql.connect(config);
    const newUG = await pool.request().query(
      `INSERT INTO [USERGROUPS] (USERGROUP) 
        OUTPUT inserted.*
        VALUES ('${name}');`
    );
    res.json(newUG.recordset);
  }

  async getUsergroup(req, res) {
    const { userid } = req.query;
    const pool = await sql.connect(config);
    const userList = await pool.request().query(
      `SELECT utable.USERGROUP_ID, utable.USERID, utable.ISADMIN, ugtable.USERGROUP
      FROM USERGROUPS as ugtable 
      RIGHT OUTER JOIN USERS as utable  
      ON ugtable.USERGROUP_ID = utable.USERGROUP_ID  
      WHERE utable.USERID = '${userid}'
      ;`
    );
    res.json(userList.recordset);
  }

  async deleteUsergroup(req, res) {
    const { usergroup } = req.query;
    const pool = await sql.connect(config);
    const deleteUG = await pool.request().query(
      `DELETE FROM [USERGROUPS] 
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroup};`
    );
    res.json(deleteUG.recordset);
  }
}

module.exports = new UserGroupController();
