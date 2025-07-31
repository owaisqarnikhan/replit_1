module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/ubuntu/logs/innovanceorbit-error.log',
    out_file: '/home/ubuntu/logs/innovanceorbit-out.log',
    log_file: '/home/ubuntu/logs/innovanceorbit-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}