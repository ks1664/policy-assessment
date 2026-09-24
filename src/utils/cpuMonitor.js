const os = require('os');
const { CPU_LIMIT } = require('../config');

function getCpuSnapshot() {
  return os.cpus().reduce((total, cpu) => {
    const times = cpu.times;
    return total + times.user + times.nice + times.sys + times.irq + times.idle;
  }, 0);
}

function startCpuMonitor() {
  let previousTotal = getCpuSnapshot();
  let previousIdle = os.cpus().reduce((total, cpu) => total + cpu.times.idle, 0);

  const timer = setInterval(() => {
    const cpus = os.cpus();
    const currentTotal = getCpuSnapshot();
    const currentIdle = cpus.reduce((total, cpu) => total + cpu.times.idle, 0);

    const totalDiff = currentTotal - previousTotal;
    const idleDiff = currentIdle - previousIdle;
    const usage = totalDiff === 0 ? 0 : ((totalDiff - idleDiff) / totalDiff) * 100;

    previousTotal = currentTotal;
    previousIdle = currentIdle;

    console.log(`CPU usage: ${usage.toFixed(2)}%`);

    if (usage >= CPU_LIMIT) {
      console.error(`CPU usage crossed ${CPU_LIMIT}%. Restarting server...`);
      clearInterval(timer);
      // PM2/systemd/Docker should restart the process after exit.
      process.exit(1);
    }
  }, 5000);

  return timer;
}

module.exports = startCpuMonitor;
