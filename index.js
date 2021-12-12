const express = require('express');
const userRouter = require('./routes/users_access.routes');
const tasksRouter = require('./routes/tasks.routes');
const taskLinksRouter = require('./routes/task_links.routes');
const usergroupRouter = require('./routes/usergroup.routes');

const PORT = process.env.PORT || 5001;
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(express.json());
app.use('/api', userRouter);
app.use('/api', tasksRouter);
app.use('/api', usergroupRouter);
app.use('/api', taskLinksRouter);

app.listen(PORT, function () {
  console.log(`server is running on port ${PORT}`);
});
