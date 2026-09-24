const ScheduledMessage = require('../models/ScheduledMessage');

async function createScheduledMessage(req, res, next) {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ message: 'message, day and time are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ message: 'Use day as YYYY-MM-DD and time as HH:mm' });
    }

    const scheduledAt = new Date(`${day}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ message: 'Invalid day or time' });
    }

    if (scheduledAt <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    const scheduledMessage = await ScheduledMessage.create({ message, scheduledAt });
    res.status(201).json(scheduledMessage);
  } catch (error) {
    next(error);
  }
}

module.exports = { createScheduledMessage };
