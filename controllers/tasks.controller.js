const sql = require('mssql');
const config = require('../config');

class TasksController {
  async createTask(req, res) {
    const { usergroup, TASK_NAME, PERIODICITY, DEADLINE, TASK_GROUP, TASK_DESCRIPTION } = req.query;
    const pool = await sql.connect(config);
    const newTask = await pool.request().query(
      `INSERT INTO TASKS (
        USERGROUP_ID, 
        TASK_NAME, 
        PERIODICITY, 
        DEADLINE, 
        TASK_GROUP, 
        TASK_DESCRIPTION,
        LAST_CHANGE
        ) 
        OUTPUT inserted.*
        VALUES (
        ${usergroup},
        '${TASK_NAME}',
        ${PERIODICITY},
        ${DEADLINE},
        '${TASK_GROUP}',
        '${TASK_DESCRIPTION}',
        GETDATE()
        );`
    );
    res.json(newTask.recordset);
  }

  async getTasks(req, res) {
    const { usergroup } = req.params;
    const pool = await sql.connect(config);
    const tasks = await pool
      .request()
      .query(`SELECT * FROM TASKS WHERE USERGROUP_ID = ${usergroup};`);
    res.json(tasks.recordset);
  }

  async countTasks(req, res) {
    const { usergroup } = req.params;
    const pool = await sql.connect(config);
    const tasks = await pool
      .request()
      .query(`SELECT COUNT(ID) AS COUNT_TASKS FROM TASKS WHERE USERGROUP_ID = ${usergroup};`);
    res.json(tasks.recordset);
  }

  async getOneTask(req, res) {
    const { taskid, usergroup } = req.params;
    const pool = await sql.connect(config);
    const user = await pool
      .request()
      .query(`SELECT * FROM TASKS WHERE ID = ${taskid} AND USERGROUP_ID = ${usergroup};`);
    res.json(user.recordset);
  }

  async updateTask(req, res) {
    const {
      TASK_NAME,
      PERIODICITY,
      DEADLINE,
      TASK_GROUP,
      TASK_DESCRIPTION,
      NOTE,
      taskid,
      usergroup,
    } = req.query;
    const pool = await sql.connect(config);
    const users = await pool.request().query(
      `UPDATE [TASKS] 
      SET 
      [TASK_NAME] = '${TASK_NAME}',
      [PERIODICITY] = ${PERIODICITY},
      [DEADLINE] = ${DEADLINE},
      [TASK_GROUP] = '${TASK_GROUP}',
      [TASK_DESCRIPTION] = '${TASK_DESCRIPTION}',
      [LAST_CHANGE] = GETDATE(),
      [NOTE] = '${NOTE}'
      OUTPUT inserted.*
      WHERE USERGROUP_ID = ${usergroup} AND ID = ${taskid};`
    );
    res.json(users.recordset);
  }
  async deleteTask(req, res) {
    const { taskid, usergroup } = req.params;
    const pool = await sql.connect(config);
    const users = await pool.request().query(
      `DELETE FROM [TASKS] 
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroup} AND ID = '${taskid}';`
    );
    res.json(users.recordset);
  }

  async getTasksLastChange(req, res) {
    const { lastchange, usergroup } = req.query;
    const pool = await sql.connect(config);
    const tasks = await pool.request().query(
      `SELECT * FROM TASKS WHERE USERGROUP_ID = ${usergroup} 
        AND LAST_CHANGE >= '${lastchange}'
        AND LAST_CHANGE IS NOT NULL
        ;`
    );
    res.json(tasks.recordset);
  }

  async updateTaskStatus(req, res) {
    const { status, usergroup, taskid, userid } = req.query;

    let queryType = '';
    switch (status) {
      case 'inprocess':
        //START
        queryType = `
        [STARTED] = GETDATE(),
        `;
        break;
      case 'done':
        //FINISH
        queryType = `
        [FINISHED] = GETDATE(),
        [AVERAGE_TIME] = (IIF([AVERAGE_TIME] IS NOT NULL,[AVERAGE_TIME],1) * 0.8) 
        + ( DATEDIFF(mi,[STARTED],GETDATE()) * 0.2),
        `;
        break;
      default:
        //RESET
        queryType = `
        [STARTED] = NULL,
        [FINISHED] = NULL,
        `;
        break;
    }
    const pool = await sql.connect(config);
    const users = await pool.request().query(
      `UPDATE [TASKS] 
      SET 
      ${queryType}
      [USERID] = '${userid}',
      [LAST_CHANGE] = GETDATE()
      OUTPUT inserted.*
      WHERE USERGROUP_ID = ${usergroup} AND ID = ${taskid};`
    );
    res.json(users.recordset);
  }
}

module.exports = new TasksController();
