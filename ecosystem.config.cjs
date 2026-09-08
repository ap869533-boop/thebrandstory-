module.exports = {
  apps: [
    {
      name: 'thebrandsstory-backend',
      script: './backend/dist/server.js',
      // If running directly with tsx without building:
      // script: 'npx',
      // args: 'tsx backend/server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
