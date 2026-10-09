
const express = require('express');
const path = require('path');
const connectDB = require('./db');

const app = express();

const taskRouter = require('./routes/tasks');

app.use(express.json());

app.use(express.static(
  path.join(__dirname, '../public')
));

app.use('/api/tasks', taskRouter);

const PORT = 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error.message
    );
    process.exit(1);
  });
