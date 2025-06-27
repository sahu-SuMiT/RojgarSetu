const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/campus_connect');
mongoose.connection.once('open', async () => {
  await mongoose.connection.db.collection('students').dropIndex('rollNumber_1');
  console.log('Dropped unique index on rollNumber');
  process.exit(0);
});