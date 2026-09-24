module.exports = {
  apps: [{
    name: 'policy-assessment-api',
    script: './src/server.js',
    instances: 1,
    autorestart: true,
    restart_delay: 1000,
    max_restarts: 20,
    env: { NODE_ENV: 'production' }
  }]
};
