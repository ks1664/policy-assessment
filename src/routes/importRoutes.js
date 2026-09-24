const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { uploadData } = require('../controllers/importController');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `upload-${Date.now()}${extension}`;

    cb(null, fileName);
  }
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error('Only CSV, XLSX and XLS files are allowed')
      );
    }

    cb(null, true);
  }
});

router.post(
  '/upload',
  upload.single('file'),
  uploadData
);

module.exports = router;