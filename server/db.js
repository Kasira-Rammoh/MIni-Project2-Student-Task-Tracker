
const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(
    'mongodb://127.0.0.1:27017/student_task_tracker'
  );

  console.log('MongoDB connected successfully');
}

module.exports = connectDB;
