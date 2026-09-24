const {
  parentPort,
  workerData
} = require('worker_threads');

const fs = require('fs');
const path = require('path');

const connectDB = require('../db');
const {
  readFile,
  importRows
} = require('../services/importService');

async function processFile() {
  try {
    await connectDB();

    const filePath = workerData.filePath;

    if (!filePath) {
      throw new Error('File path was not received by worker');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const stats = fs.statSync(filePath);

    if (!stats.isFile()) {
      throw new Error(
        `Expected a file but received a directory: ${filePath}`
      );
    }

    console.log(
      `Worker processing: ${path.basename(filePath)}`
    );

    const rows = await readFile(filePath);

    console.log(`Rows found: ${rows.length}`);

    const imported = await importRows(rows);

    parentPort.postMessage({
      ok: true,
      imported
    });
  } catch (error) {
    console.error('Worker import failed:', error);

    parentPort.postMessage({
      ok: false,
      error: error.message
    });
  }
}

processFile();