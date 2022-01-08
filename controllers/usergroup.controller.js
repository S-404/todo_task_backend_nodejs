const sql = require('mssql');
const config = require('../config');

class UserGroupController {
  async createUsergroup(req, res) {
    const { name, userid } = req.query;
    const pool = await sql.connect(config);
    const newUG = await pool.request().query(
      `INSERT INTO [USERGROUPS] (USERGROUP) 
        OUTPUT inserted.*
        VALUES ('${name}');`
    );
    let usergroup = newUG.recordset[0].USERGROUP_ID;
    if (usergroup) {
      const newUGAdmin = await pool.request().query(
        `INSERT INTO USERS_ACCESS 
        (USERGROUP_ID, USERID, ISADMIN) 
        OUTPUT inserted.*
        VALUES 
        (${usergroup},'${userid}',1);`
      );
    }

    res.json(newUG.recordset);
  }

  async getUsergroup(req, res) {
    const { userid } = req.query;
    const pool = await sql.connect(config);
    const userList = await pool.request().query(
      `SELECT utable.USERGROUP_ID, utable.USERID, utable.ISADMIN, ugtable.USERGROUP
      FROM USERGROUPS as ugtable 
      RIGHT OUTER JOIN USERS_ACCESS as utable  
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
