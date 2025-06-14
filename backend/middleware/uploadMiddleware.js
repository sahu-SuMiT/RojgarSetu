
const multer = require('multer');

// Use memory storage for direct-to-mongo
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;