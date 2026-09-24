const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/policy_assessment';
const CPU_LIMIT = Number(process.env.CPU_LIMIT || 70);

module.exports = { PORT, MONGO_URI, CPU_LIMIT };
