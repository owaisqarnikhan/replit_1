module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/innovanceorbit',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/innovanceorbit-error.log',
    out_file: '/var/log/pm2/innovanceorbit-out.log',
    log_file: '/var/log/pm2/innovanceorbit-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};