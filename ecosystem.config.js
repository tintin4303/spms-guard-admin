module.exports = {
  apps: [
    {
      name: 'spms-backend',
      script: 'npm',
      args: 'run start',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
