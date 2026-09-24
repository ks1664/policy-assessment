const path = require('path');
const { Worker } = require('worker_threads');

function uploadData(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: 'Please upload a CSV or XLSX file'
    });
  }

  console.log('Uploaded file:', {
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size
  });

  const workerPath = path.join(
    __dirname,
    '../workers/importWorker.js'
  );

  const worker = new Worker(workerPath, {
    workerData: {
      filePath: req.file.path
    }
  });

  worker.on('message', (result) => {
    if (!result.ok) {
      return res.status(500).json({
        message: result.error
      });
    }

    return res.status(201).json({
      message: 'Import completed successfully',
      imported: result.imported
    });
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);

    return res.status(500).json({
      message: error.message
    });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(
        `Import worker stopped with code ${code}`
      );
    }
  });
}

module.exports = {
  uploadData
};