const config = {
  user: 'user',
  password: 'Qwerty_1234',
  server: 'DESKTOP-XXXXX',
  database: 'TODO_TASK',
  port: 1433,
  dialect: 'mssql',
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
  dialectOptions: {
    instanceName: 'SQLEXPRESS',
  },
  trustServerCertificate: true,
};
module.exports = config;
