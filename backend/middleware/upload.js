const multer = require('multer');
const path = require('path');

// For profile images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profileImages/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// For documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const imageUpload = multer({ storage: imageStorage });
const documentUpload = multer({ storage: documentStorage });

module.exports = {
  imageUpload,
  documentUpload,
};