const sql = require('mssql');
const config = require('../config');

const ISMAINcheck = (str) => {
  return str === 'true' ? 1 : 0;
};
class TaksLinkController {
  async createTaskLink(req, res) {
    const { USERGROUP_ID, TASK_ID, TASK_LINK, ISMAIN, LINK_DESCRIPTION } =
      req.query;
    const pool = await sql.connect(config);
    const newTaskLink = await pool.request().query(
      `INSERT INTO [TASK_LINKS] 
      (USERGROUP_ID
        ,TASK_ID
        ,TASK_LINK
        ,ISMAIN
        ,LINK_DESCRIPTION) 

      OUTPUT inserted.*

      VALUES 
      (${USERGROUP_ID},
        ${TASK_ID},
        '${TASK_LINK}',
        ${ISMAINcheck(ISMAIN)},
        '${LINK_DESCRIPTION}');`
    );
    res.json(newTaskLink.recordset);
  }
  async getTaskLinks(req, res) {
    const { usergroup } = req.params;
    const pool = await sql.connect(config);
    const taskLinks = await pool.request().query(
      `SELECT * FROM [TASK_LINKS] WHERE USERGROUP_ID = ${usergroup}
      ;`
    );
    res.json(taskLinks.recordset);
  }

  async updateTaskLink(req, res) {
    const { USERGROUP_ID, ID, TASK_LINK, ISMAIN, LINK_DESCRIPTION } = req.query;
    const pool = await sql.connect(config);
    const taskLinkUpd = await pool.request().query(
      `UPDATE [TASK_LINKS]
      SET 
      TASK_LINK = '${TASK_LINK}'
      ,ISMAIN = ${ISMAINcheck(ISMAIN)}
      ,LINK_DESCRIPTION = '${LINK_DESCRIPTION}'
      OUTPUT inserted.*
	    WHERE ID = ${ID};`
    );
    res.json(taskLinkUpd.recordset);
  }
  async deleteTaskLink(req, res) {
    const { tasklinkid, usergroupid } = req.params;
    const pool = await sql.connect(config);
    const taskLinkDel = await pool.request().query(
      `DELETE FROM [TASK_LINKS]
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroupid} AND ID = '${tasklinkid}';`
    );
    res.json(taskLinkDel.recordset);
  }
}

module.exports = new TaksLinkController();
