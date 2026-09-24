require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const { PORT } = require('./config');
const importRoutes = require('./routes/importRoutes');
const policyRoutes = require('./routes/policyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const startCpuMonitor = require('./utils/cpuMonitor');
const { startScheduler } = require('./services/schedulerService');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/import', importRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/messages', scheduleRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Internal server error' });
});

async function start() {
  await connectDB();
  startScheduler();
  startCpuMonitor();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(error => {
  console.error('Startup failed:', error);
  process.exit(1);
});
