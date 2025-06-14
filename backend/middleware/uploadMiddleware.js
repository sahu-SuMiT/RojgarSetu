const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create folders if they don't exist
const profileImageDir = path.join(__dirname, '../uploads/profileImages');
const documentDir = path.join(__dirname, '../uploads/documents');

[profileImageDir, documentDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for profile images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImageDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Storage for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const imageUpload = multer({ storage: imageStorage });
const documentUpload = multer({ storage: documentStorage });

module.exports = { imageUpload, documentUpload };