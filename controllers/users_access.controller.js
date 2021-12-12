const sql = require('mssql');
const config = require('../config');

class UserAccessController {
  async createUserAccess(req, res) {
    const { usergroup, userid, isadmin } = req.query;
    const pool = await sql.connect(config);
    const newUser = await pool.request().query(
      `INSERT INTO USERS_ACCESS 
      (USERGROUP_ID, USERID, ISADMIN) 
      OUTPUT inserted.*
      VALUES 
      (${usergroup},'${userid}',${+isadmin});`
    );
    res.json(newUser.recordset);
  }
  async getUsersAccess(req, res) {
    const { usergroup } = req.params;
    const pool = await sql.connect(config);
    const userList = await pool.request().query(
      `SELECT [USERID], [ISADMIN]
      FROM [USERS_ACCESS] WHERE USERGROUP_ID = ${usergroup}
      ;`
    );
    res.json(userList.recordset);
  }
  async getOneUserAccess(req, res) {
    const { userid, usergroup } = req.params;
    const pool = await sql.connect(config);
    const user = await pool.request().query(
      `SELECT [USERID], [ISADMIN]
      FROM [USERS_ACCESS] WHERE USERGROUP_ID = ${usergroup} AND USERID = '${userid}'
      ;`
    );

    res.json(user.recordset);
  }
  async updateUserAccess(req, res) {
    const { usergroup, userid, isadmin } = req.query;
    const pool = await sql.connect(config);
    const userUpd = await pool.request().query(
      `UPDATE [USERS_ACCESS] 
      SET [ISADMIN] = ${+isadmin}
      OUTPUT inserted.*
	    WHERE USERGROUP_ID = ${usergroup} AND USERID = '${userid}';`
    );
    res.json(userUpd.recordset);
  }
  async deleteUserAccess(req, res) {
    const { userid, usergroup } = req.params;
    const pool = await sql.connect(config);
    const userDel = await pool.request().query(
      `DELETE FROM [USERS_ACCESS] 
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroup} AND USERID = '${userid}';`
    );
    res.json(userDel.recordset);
  }
}

module.exports = new UserAccessController();
