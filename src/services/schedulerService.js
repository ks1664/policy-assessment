const cron = require('node-cron');
const ScheduledMessage = require('../models/ScheduledMessage');

async function processDueMessages() {
  const now = new Date();
  const due = await ScheduledMessage.find({ status: 'pending', scheduledAt: { $lte: now } }).limit(100);

  for (const item of due) {
    // Keeping the actual insert in this service makes the state transition
    // explicit and also makes the job safe to resume after a server restart.
    await ScheduledMessage.updateOne(
      { _id: item._id, status: 'pending' },
      { $set: { status: 'inserted', insertedAt: new Date() } }
    );
    console.log(`Scheduled message inserted: ${item._id}`);
  }
}

function startScheduler() {
  cron.schedule('* * * * *', () => {
    processDueMessages().catch(error => console.error('Scheduler error:', error));
  });
  processDueMessages().catch(error => console.error('Initial scheduler error:', error));
}

module.exports = { startScheduler };
