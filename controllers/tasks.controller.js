const getDateFormat = require('../utils');
const sql = require('mssql');
const config = require('../config');

class TasksController {
  async createTask(req, res) {
    const {
      usergroupid,
      TASK_NAME,
      PERIODICITY,
      DEADLINE,
      TASK_GROUP,
      TASK_DESCRIPTION,
    } = req.query;
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
        ${usergroupid},
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
    const { usergroupid } = req.params;
    const pool = await sql.connect(config);
    const tasks = await pool
      .request()
      .query(`SELECT * FROM TASKS WHERE USERGROUP_ID = ${usergroupid};`);
    res.json(tasks.recordset);
  }

  async countTasks(req, res) {
    const { usergroupid } = req.params;
    const pool = await sql.connect(config);
    const tasks = await pool
      .request()
      .query(
        `SELECT COUNT(ID) AS COUNT_TASKS FROM TASKS WHERE USERGROUP_ID = ${usergroupid};`
      );
    res.json(tasks.recordset);
  }

  async getOneTask(req, res) {
    const { taskid, usergroupid } = req.params;
    const pool = await sql.connect(config);
    const user = await pool
      .request()
      .query(
        `SELECT * FROM TASKS WHERE ID = ${taskid} AND USERGROUP_ID = ${usergroupid};`
      );
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
      ID,
      usergroupid,
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
      WHERE USERGROUP_ID = ${usergroupid} AND ID = ${ID};`
    );
    res.json(users.recordset);
  }
  async deleteTask(req, res) {
    const { taskid, usergroupid } = req.params;
    const pool = await sql.connect(config);
    const users = await pool.request().query(
      `DELETE FROM [TASKS] 
      OUTPUT deleted.*
      WHERE USERGROUP_ID = ${usergroupid} AND ID = '${taskid}';`
    );
    res.json(users.recordset);
  }

  async getTasksLastChange(req, res) {
    const { lastchange, USERGROUP_ID } = req.query;
    const pool = await sql.connect(config);
    const tasks = await pool.request().query(
      `SELECT * FROM TASKS WHERE USERGROUP_ID = ${USERGROUP_ID} 
        AND LAST_CHANGE >= '${lastchange}'
        AND LAST_CHANGE IS NOT NULL
        ;`
    );

    res.json(tasks.recordset);
  }

  async updateTaskStatus2(req, res) {
    const { status, USERGROUP_ID, ID, userid } = req.query;

    let queryType = '';
    switch (status) {
      case 'start':
        //START
        queryType = `
        [STARTED] = GETDATE(),
        `;
        break;
      case 'finish':
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
      WHERE USERGROUP_ID = ${USERGROUP_ID} AND ID = ${ID};`
    );
    res.json(users.recordset);
  }

  async updateTaskStatus(req, res) {
    const { status, USERGROUP_ID, ID, userid } = req.query;

    let queryType = '';

    switch (status) {
      case 'start':
        //START
        queryType = `
        [STARTED] = GETDATE(),
        `;
        break;
      case 'finish':
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
    const updStatus = await pool.request().query(
      `UPDATE [TASKS] 
      SET 
      ${queryType}
      [USERID] = '${userid}',
      [LAST_CHANGE] = GETDATE()
      OUTPUT inserted.*
      WHERE USERGROUP_ID = ${USERGROUP_ID} AND ID = ${ID};`
    );

    let id = updStatus.recordset[0].ID;
    if (id) {
      let setFinished =
        status === 'finish'
          ? `'${getDateFormat(updStatus.recordset[0].FINISHED)}'`
          : 'NULL';
      let setStarted =
        status !== 'reset'
          ? `'${getDateFormat(updStatus.recordset[0].STARTED)}'`
          : 'NULL';
      let archiveQuery =
        status !== 'reset'
          ? `IF EXISTS (
        SELECT * FROM TASK_ARCHIVE
        WHERE 
        USERGROUP_ID = ${updStatus.recordset[0].USERGROUP_ID} 
        AND TASK_ID = ${id}
        AND DATE_ = CAST(GETDATE() AS DATE)
      )
        BEGIN
          UPDATE TASK_ARCHIVE
          SET 
          STARTED = ${setStarted} ,
          FINISHED = ${setFinished} ,
          USERID = '${updStatus.recordset[0].USERID}'
          WHERE
          USERGROUP_ID = ${updStatus.recordset[0].USERGROUP_ID} 
          AND TASK_ID = ${id}
          AND DATE_ = CAST(GETDATE() AS DATE);
        END
      ELSE
        BEGIN
        INSERT INTO TASK_ARCHIVE
        ([TASK_ID]
          ,[TASK_NAME]
          ,[STARTED]
          ,[FINISHED]
          ,[USERID]
          ,[USERGROUP_ID]
          ,[DATE_])
        VALUES
        (
          ${updStatus.recordset[0].ID}
          ,N'${updStatus.recordset[0].TASK_NAME}'
          ,${setStarted}
          ,${setFinished}
          ,N'${updStatus.recordset[0].USERID}'
          ,${updStatus.recordset[0].USERGROUP_ID}
          ,CAST(GETDATE() AS DATE)
        )
        END`
          : `DELETE FROM TASK_ARCHIVE
      WHERE
      USERGROUP_ID = ${USERGROUP_ID} 
      AND TASK_ID = ${ID}
      AND DATE_ = CAST(GETDATE() AS DATE)
      `;
      const archive = await pool.request().query(archiveQuery);
    }
    res.json(updStatus.recordset);
  }
}

module.exports = new TasksController();
